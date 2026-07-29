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
import { firebaseReady, db, auth, OWNER_UID } from "../../services/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

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
    // Order by a client timestamp, not serverTimestamp(): the latter is null in
    // the local echo before the write reaches the server, which would hide the
    // creator's own fresh pin from an orderBy(createdAt) query for a moment.
    const q = query(
      collection(db, COLLECTION),
      orderBy("createdClient", "desc"),
      limit(200)
    );
    return onSnapshot(
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
  }
  pinSubs.add(cb);
  cb(readJSON(PINS_KEY, []));
  return () => pinSubs.delete(cb);
}

// Add a pin. Resolves once written; the subscription delivers the new list.
export async function addPin({ name, message, color, tape }) {
  const base = { name, message, color, tape, loved: false, likes: 0 };
  if (firebaseReady) {
    await addDoc(collection(db, COLLECTION), {
      ...base,
      date: new Date().toDateString(),
      createdClient: Date.now(), // present in the local echo → instant display
      createdAt: serverTimestamp(),
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
    await deleteDoc(doc(db, COLLECTION, id));
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
    await updateDoc(doc(db, COLLECTION, id), fields);
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
    return onAuthStateChanged(auth, (user) => {
      // If an owner UID is configured, require an exact match; otherwise any
      // signed-in user counts (single-account projects).
      cb(Boolean(user) && (!OWNER_UID || user.uid === OWNER_UID));
    });
  }
  ownerSubs.add(cb);
  cb(window.localStorage.getItem(OWNER_KEY) === "1");
  return () => ownerSubs.delete(cb);
}

// Firebase mode: sign in with email/password. Local mode: flip the flag.
export async function ownerSignIn(email, password) {
  if (firebaseReady) {
    await signInWithEmailAndPassword(auth, email, password);
    return;
  }
  window.localStorage.setItem(OWNER_KEY, "1");
  emitOwner();
}

export async function ownerSignOut() {
  if (firebaseReady) {
    await signOut(auth);
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
