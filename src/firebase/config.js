// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB888H_u3aRvQtbaR33u6ssYFqoOI79gzI",
  authDomain: "mindbridge-6149e.firebaseapp.com",
  projectId: "mindbridge-6149e",
  storageBucket: "mindbridge-6149e.firebasestorage.app",
  messagingSenderId: "1007331897897",
  appId: "1:1007331897897:web:cfc5a353dd8a6c32a9a238",
  measurementId: "G-DXEBFMS5HT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
