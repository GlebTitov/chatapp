// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCHtKFCyf9eIgver8IjibMfbb73xq7GicA",
    authDomain: "chatapp-4c3f5.firebaseapp.com",
    projectId: "chatapp-4c3f5",
    storageBucket: "chatapp-4c3f5.firebasestorage.app",
    messagingSenderId: "532047454677",
    appId: "1:532047454677:web:6c16e30f327a5561fe1d5c",
    measurementId: "G-B9RGV8MP9J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };