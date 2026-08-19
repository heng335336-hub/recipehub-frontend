// -----------------------------------------------------------------------
// PASTE YOUR OWN FIREBASE CONFIG BELOW.
//
// Get these values from:
// Firebase Console -> Project Settings (gear icon) -> General
//   -> "Your apps" -> Web app (</>) -> SDK setup and configuration
//
// Do NOT commit real keys to a public repo. For a student project this is
// usually fine (Firebase web config is not a secret the way an API key
// normally is - access is controlled by Firestore/Storage security rules,
// not by hiding this object) but it's still good practice to use a
// .env file for it. A .env-based version is shown further below.
// -----------------------------------------------------------------------

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCyLNusR3Qof1_ZzmuQrpAPnYcHM2hoFIc",
  authDomain: "recipe-website-15a75.firebaseapp.com",
  projectId: "recipe-website-15a75",
  storageBucket: "recipe-website-15a75.firebasestorage.app",
  messagingSenderId: "721403990557",
  appId: "1:721403990557:web:6fb680fef32f69b165ecf4",
};

// ---- OPTIONAL: use environment variables instead (recommended) ----
// 1. Create a file named `.env` in the `frontend/` folder (same level as
//    package.json) with this content, filled in with your real values:
//
//    VITE_FIREBASE_API_KEY=your_api_key
//    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
//    VITE_FIREBASE_PROJECT_ID=your_project_id
//    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
//    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
//    VITE_FIREBASE_APP_ID=your_app_id
//
// 2. Then replace the firebaseConfig object above with:
//
//    const firebaseConfig = {
//      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//      appId: import.meta.env.VITE_FIREBASE_APP_ID,
//    };
//
// 3. Add `.env` to your `.gitignore` file.
// ---------------------------------------------------------------------

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
