// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAFntOsnimhiBnCJAF6AsflDHmBhWhraoc",
  authDomain: "oceanic-vr-dive.firebaseapp.com",
  projectId: "oceanic-vr-dive",
  storageBucket: "oceanic-vr-dive.firebasestorage.app",
  messagingSenderId: "907684558679",
  appId: "1:907684558679:web:d46079730c3dfaa4d3f012",
  measurementId: "G-HKZP6HF4DZ"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 기능별로 export
export const auth = getAuth(app);         // 로그인/회원가입 등 인증 관련
export const db = getFirestore(app);      // Firestore 데이터베이스
