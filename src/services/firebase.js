// =============================================================
//  Firebase — shared Guild Board backend (Firestore + Auth)
// -------------------------------------------------------------
//  Config comes from env vars (see .env.example). When the keys
//  aren't set, `firebaseReady` is false and the Guild Board falls
//  back to per-browser localStorage, so the site always works.
//
//  These keys are safe to expose in the client bundle — Firebase
//  access is governed by Firestore Security Rules, not by hiding
//  the config. See firestore.rules.
// =============================================================
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// The owner's Auth UID — only this user may delete pins (enforced by rules).
// Optional in the client; used to decide when to show delete controls.
export const OWNER_UID = process.env.REACT_APP_GUILD_OWNER_UID || "";

export const firebaseReady = Boolean(
  config.apiKey && config.projectId && config.appId
);

let db = null;
let auth = null;

if (firebaseReady) {
  const app = initializeApp(config);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };
