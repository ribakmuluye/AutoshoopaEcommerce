// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYm8wr664LTrZsbqcy6gaPa_w1ExUZXps",
  authDomain: "autoshoopa.firebaseapp.com",
  projectId: "autoshoopa",
  storageBucket: "autoshoopa.firebasestorage.app",
  messagingSenderId: "826684134265",
  appId: "1:826684134265:web:3cdf120c4c740c05db95a8",
  measurementId: "G-GC7RM21RDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app; 