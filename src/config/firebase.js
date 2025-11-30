import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyC21w2owMklDBusCJQpILTYsZ6rLXuQpfE",
    authDomain: "tp-repair.firebaseapp.com",
    projectId: "tp-repair",
    storageBucket: "tp-repair.firebasestorage.app",
    messagingSenderId: "177253446010",
    appId: "1:177253446010:web:337200a4415e270f7b66c3",
    measurementId: "G-BWJHC8SEE9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});
