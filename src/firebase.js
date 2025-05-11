// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBS3Lz3VTm9_2_lTm9RRE4LGbkgyudzANs",
    authDomain: "cosmos-56706.firebaseapp.com",
    projectId: "cosmos-56706",
    storageBucket: "cosmos-56706.firebasestorage.app",
    messagingSenderId: "549353213878",
    appId: "1:549353213878:web:98407ebff88bcec7a0fb17",
    measurementId: "G-TMJFPHXRP8"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };