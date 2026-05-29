import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
try {
  // Initialize Firebase only if it hasn't been initialized already and we have an API key
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } else {
    console.warn("Firebase client initialization skipped: Missing NEXT_PUBLIC_FIREBASE_API_KEY.");
  }
} catch (e) {
  console.error("Firebase client initialization error", e);
}

const auth = app ? getAuth(app) : ({} as any);
// Optional: Ensure persistence is set to local (default in web)
if (app) {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export { app, auth };
