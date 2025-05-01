// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // ✅ 스토리지 추가

const firebaseConfig = {
  apiKey: "AIzaSyAFntOsnimhiBnCJAF6AsflDHmBhWhraoc",
  authDomain: "oceanic-vr-dive.firebaseapp.com",
  projectId: "oceanic-vr-dive",
  storageBucket: "oceanic-vr-dive.firebasestorage.app", // ✅ 여기 수정 중요!!!
  messagingSenderId: "907684558679",
  appId: "1:907684558679:web:d46079730c3dfaa4d3f012",
  measurementId: "G-HKZP6HF4DZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ storage export
