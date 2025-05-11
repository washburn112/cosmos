// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBS3Lz3VTm9_2_lTm9RRE4LGbkgyudzANs",
    authDomain: "cosmos-56706.firebaseapp.com",
    projectId: "cosmos-56706",
    storageBucket: "cosmos-56706.firebasestorage.app",
    messagingSenderId: "549353213878",
    appId: "1:549353213878:web:98407ebff88bcec7a0fb17",
    measurementId: "G-TMJFPHXRP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Firebase persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        // The current browser doesn't support persistence
        console.warn('Firebase persistence not supported by this browser');
    }
});

export { db, auth, storage };