// =============================================================
//  Guild Board store
// -------------------------------------------------------------
//  One API, two backends:
//   • Firebase configured  → Firestore (shared, real-time) + Auth
//     (owner-only delete). Everyone sees everyone's pins.
//   • Not configured       → per-browser localStorage fallback so
//     the site still works before Firebase is set up.
//  Guild.js talks only to this module and never branches on which
//  backend is active.
// =============================================================
//  The Firebase SDK is loaded on demand (see services/firebase.js) — the
//  subscribe* functions still return their unsubscribe synchronously, by
//  handing back a closure that cancels the in-flight import if the caller
//  unmounts before the SDK lands.
import {
  firebaseReady,
  getDb,
  getAuthApi,
  OWNER_UID,
} from "../../services/firebase";

export { firebaseReady };

const COLLECTION = "guildPins";
const PINS_KEY = "guild.pins.v1"; // local fallback: visitor pins
const OWNER_KEY = "guild.owner.v1"; // local fallback: owner flag

// ---- local storage helpers ------------------------------------------------
function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    /* ignore */
  }
}

// Tiny pub/sub so the local backend can push updates like Firestore does.
const pinSubs = new Set();
const ownerSubs = new Set();
const emitPins = () => {
  const pins = readJSON(PINS_KEY, []);
  pinSubs.forEach((cb) => cb(pins));
};
const emitOwner = () => {
  const isOwner = window.localStorage.getItem(OWNER_KEY) === "1";
  ownerSubs.forEach((cb) => cb(isOwner));
};

// ---- pins ------------------------------------------------------------------

// Subscribe to the live list of pins (newest first). Returns an unsubscribe fn.
export function subscribePins(cb) {
  if (firebaseReady) {
    let stop = null;
    let cancelled = false;
    getDb()
      .then(({ db, fs }) => {
        if (cancelled) return;
        // Order by a client timestamp, not serverTimestamp(): the latter is
        // null in the local echo before the write reaches the server, which
        // would hide the creator's own fresh pin from an orderBy(createdAt)
        // query for a moment.
        const q = fs.query(
          fs.collection(db, COLLECTION),
          fs.orderBy("createdClient", "desc"),
          fs.limit(200)
        );
        stop = fs.onSnapshot(
          q,
          (snap) => {
            const pins = snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                ...data,
                // serverTimestamp() is null on the local echo before the write
                // lands — fall back to "now" so a fresh pin still shows a date.
                date: data.date || new Date().toDateString(),
              };
            });
            cb(pins);
          },
          (err) => {
            // eslint-disable-next-line no-console
            console.error("Guild subscribe failed:", err);
            cb([]);
          }
        );
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Guild subscribe failed:", err);
        if (!cancelled) cb([]);
      });
    return () => {
      cancelled = true;
      if (stop) stop();
    };
  }
  pinSubs.add(cb);
  cb(readJSON(PINS_KEY, []));
  return () => pinSubs.delete(cb);
}

// Add a pin. Resolves once written; the subscription delivers the new list.
export async function addPin({ name, message, color, tape }) {
  const base = { name, message, color, tape, loved: false, likes: 0 };
  if (firebaseReady) {
    const { db, fs } = await getDb();
    await fs.addDoc(fs.collection(db, COLLECTION), {
      ...base,
      date: new Date().toDateString(),
      createdClient: Date.now(), // present in the local echo → instant display
      createdAt: fs.serverTimestamp(),
    });
    return;
  }
  const cur = readJSON(PINS_KEY, []);
  const next = [
    { id: `pin-${Date.now()}`, ...base, date: new Date().toDateString() },
    ...cur,
  ];
  writeJSON(PINS_KEY, next);
  emitPins();
}

// Delete a pin (owner only; Firestore rules enforce this server-side).
export async function deletePin(id) {
  if (firebaseReady) {
    const { db, fs } = await getDb();
    await fs.deleteDoc(fs.doc(db, COLLECTION, id));
    return;
  }
  const next = readJSON(PINS_KEY, []).filter((n) => n.id !== id);
  writeJSON(PINS_KEY, next);
  emitPins();
}

// Update a pin's editable fields (owner only; enforced by Firestore rules).
// Only the passed fields are written — other fields on the doc are preserved.
export async function updatePin(id, fields) {
  if (firebaseReady) {
    const { db, fs } = await getDb();
    await fs.updateDoc(fs.doc(db, COLLECTION, id), fields);
    return;
  }
  const next = readJSON(PINS_KEY, []).map((n) =>
    n.id === id ? { ...n, ...fields } : n
  );
  writeJSON(PINS_KEY, next);
  emitPins();
}

// ---- owner mode ------------------------------------------------------------

// Subscribe to owner (can-delete) state. Returns an unsubscribe fn.
export function subscribeOwner(cb) {
  if (firebaseReady) {
    let stop = null;
    let cancelled = false;
    getAuthApi()
      .then(({ auth, authApi }) => {
        if (cancelled) return;
        stop = authApi.onAuthStateChanged(auth, (user) => {
          // If an owner UID is configured, require an exact match; otherwise
          // any signed-in user counts (single-account projects).
          cb(Boolean(user) && (!OWNER_UID || user.uid === OWNER_UID));
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Owner subscribe failed:", err);
        if (!cancelled) cb(false);
      });
    return () => {
      cancelled = true;
      if (stop) stop();
    };
  }
  ownerSubs.add(cb);
  cb(window.localStorage.getItem(OWNER_KEY) === "1");
  return () => ownerSubs.delete(cb);
}

// Firebase mode: sign in with email/password. Local mode: flip the flag.
export async function ownerSignIn(email, password) {
  if (firebaseReady) {
    const { auth, authApi } = await getAuthApi();
    await authApi.signInWithEmailAndPassword(auth, email, password);
    return;
  }
  window.localStorage.setItem(OWNER_KEY, "1");
  emitOwner();
}

export async function ownerSignOut() {
  if (firebaseReady) {
    const { auth, authApi } = await getAuthApi();
    await authApi.signOut(auth);
    return;
  }
  window.localStorage.removeItem(OWNER_KEY);
  emitOwner();
}

// Local-only helper: enable owner mode via the ?guild=owner URL gate (there is
// no password in local mode). No-op under Firebase, where sign-in is required.
export function localOwnerEnable() {
  if (firebaseReady) return;
  window.localStorage.setItem(OWNER_KEY, "1");
  emitOwner();
}
