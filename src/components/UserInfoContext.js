import { createContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; // ✅ updateDoc, serverTimestamp 추가

export const UserInfoContext = createContext();

export function UserInfoProvider({ children }) {
  const [user, setUser] = useState(undefined); // 초기값 undefined
  const [userData, setUserData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  // 🔄 Firebase 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          await currentUser.reload();
          const reloadedUser = auth.currentUser;
          setUser(reloadedUser);
          localStorage.setItem('userUid', reloadedUser.uid);

          const userRef = doc(db, 'users', reloadedUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            // ✅ 로그인 성공 시 lastLoginAt 업데이트
            await updateDoc(userRef, {
              lastLoginAt: serverTimestamp(),
            });

            const data = userDoc.data();
            const mergedData = {
              uid: reloadedUser.uid,
              email: reloadedUser.email,
              emailVerified: reloadedUser.emailVerified,
              ...data,
            };
            setUserData(mergedData);
            localStorage.setItem('userData', JSON.stringify(mergedData));
          } else {
            const fallbackData = {
              uid: reloadedUser.uid,
              email: reloadedUser.email,
              emailVerified: reloadedUser.emailVerified,
            };
            setUserData(fallbackData);
            localStorage.setItem('userData', JSON.stringify(fallbackData));
          }
        } catch (err) {
          console.error('🔥 유저 정보 로딩 실패:', err);
          setUser(currentUser);
          setUserData({
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified,
          });
        }
      } else {
        setUser(null);
        setUserData(null);
        localStorage.removeItem('userUid');
        localStorage.removeItem('userData');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ 새로고침 시 localStorage에서 복원
  useEffect(() => {
    const savedUid = localStorage.getItem('userUid');
    const savedUserData = localStorage.getItem('userData');
    if (savedUid && savedUserData) {
      const parsedData = JSON.parse(savedUserData);
      if (parsedData && parsedData.uid) {
        setUser({ uid: parsedData.uid });
        setUserData(parsedData);
      }
    }
  }, []);

  return (
    <UserInfoContext.Provider value={{ user, userData, loading }}>
      {children}
    </UserInfoContext.Provider>
  );
}
