import React, { createContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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
          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            await setDoc(userRef, {
              email: currentUser.email,
              nickname: currentUser.displayName || '익명',
              isLoggedIn: true,
              lastLogin: serverTimestamp(),
            });
          } else {
            await updateDoc(userRef, {
              isLoggedIn: true,
              lastLogin: serverTimestamp(),
            });
          }

          // 사용자 정보 가져오기
          const updatedSnap = await getDoc(userRef);
          if (updatedSnap.exists()) {
            setUserData(updatedSnap.data());
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
