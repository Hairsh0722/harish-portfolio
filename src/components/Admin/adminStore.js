// =============================================================
//  Admin store — owner-only content writes
// -------------------------------------------------------------
//  Thin Firestore write layer used by the in-site admin panel.
//  Every write here is gated by firestore.rules (owner-only), so
//  a non-owner request is rejected server-side even if it reached
//  this module. Reads reuse the app's normal content loaders.
// =============================================================
import { db } from "../../services/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
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

// Upsert a document in a content collection (full overwrite by id).
export function saveItem(collectionName, id, data) {
  return setDoc(doc(db, collectionName, id), data);
}

// Remove a document from a content collection.
export function deleteItem(collectionName, id) {
  return deleteDoc(doc(db, collectionName, id));
}

// Skill stats live on a single settings doc.
export function saveStats(stats) {
  return setDoc(doc(db, "meta", "site"), { stats });
}

// Per-language text overlay (the full i18next tree for that language).
export function saveText(lang, tree) {
  return setDoc(doc(db, "content", lang), tree);
}
