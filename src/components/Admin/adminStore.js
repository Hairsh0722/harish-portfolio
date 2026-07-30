// =============================================================
//  Admin store — owner-only content writes
// -------------------------------------------------------------
//  Thin Firestore write layer used by the in-site admin panel.
//  Every write here is gated by firestore.rules (owner-only), so
//  a non-owner request is rejected server-side even if it reached
//  this module. Reads reuse the app's normal content loaders.
// =============================================================
import { getDb } from "../../services/firebase";
import {
  loadStructuralContent,
  loadTextOverlays,
} from "../../services/content";

export { loadStructuralContent, loadTextOverlays };

// Owner auth + Guild pin management are shared with the Guild Board (one
// Firebase account / collection).
export {
  firebaseReady,
  subscribeOwner,
  ownerSignIn,
  ownerSignOut,
  subscribePins,
  updatePin,
  deletePin,
} from "../Guild/guildStore";

/**
 * Turn a Firestore write failure into something the owner can act on.
 *
 * "Missing or insufficient permissions" almost always means the rules in
 * firestore.rules haven't been published to the live project (Firestore denies
 * every path it doesn't match), not that the sign-in is wrong — so say that
 * instead of echoing the SDK's message.
 */
export function describeWriteError(err) {
  const code = err && err.code;
  if (code === "permission-denied")
    return (
      "Denied by Firestore rules — an edit to firestore.rules does nothing " +
      "until it's published: run npm run deploy:rules (see CONTENT.md)."
    );
  if (code === "unauthenticated")
    return "Signed out — sign in again as the owner and retry.";
  if (code === "unavailable")
    return "Can't reach Firestore. Check your connection and retry.";
  return (err && err.message) || "Save failed.";
}

// Upsert a document in a content collection (full overwrite by id).
export async function saveItem(collectionName, id, data) {
  const { db, fs } = await getDb();
  return fs.setDoc(fs.doc(db, collectionName, id), data);
}

// Remove a document from a content collection.
export async function deleteItem(collectionName, id) {
  const { db, fs } = await getDb();
  return fs.deleteDoc(fs.doc(db, collectionName, id));
}

// Skill stats live on a single settings doc.
export async function saveStats(stats) {
  const { db, fs } = await getDb();
  return fs.setDoc(fs.doc(db, "meta", "site"), { stats });
}

// Per-language text overlay (the full i18next tree for that language).
export async function saveText(lang, tree) {
  const { db, fs } = await getDb();
  return fs.setDoc(fs.doc(db, "content", lang), tree);
}
