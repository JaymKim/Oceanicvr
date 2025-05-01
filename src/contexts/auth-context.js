import React, { createContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const UserInfoContext = createContext();

export default function UserInfoProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, 'users', currentUser.uid);

          // Firestore에 로그인 상태 저장
          await updateDoc(userRef, {
            isLoggedIn: true,
            lastLogin: serverTimestamp(),
          });

          // 사용자 정보 가져오기
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUserData(snap.data());
          }
        } catch (err) {
          console.error('Firestore 로그인 처리 오류:', err);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const logout = async () => {
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          isLoggedIn: false,
        });
      } catch (err) {
        console.error('로그아웃 시 Firestore 업데이트 오류:', err);
      }
    }
    await signOut(auth);
  };

  return (
    <UserInfoContext.Provider value={{ user, userData, logout }}>
      {children}
    </UserInfoContext.Provider>
  );
}