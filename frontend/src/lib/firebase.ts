import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8byJ3iynv_GBbUU_ju4f17BXynQVBNpA",
  authDomain: "thahoor-protein-369.firebaseapp.com",
  projectId: "thahoor-protein-369",
  storageBucket: "thahoor-protein-369.firebasestorage.app",
  messagingSenderId: "443963419135",
  appId: "1:443963419135:web:ac6df94e3f4da261491fca",
  measurementId: "G-DD17J00CE8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage, analytics };
