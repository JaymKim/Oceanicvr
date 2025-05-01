import React, { useEffect, useState, useContext } from 'react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function DivePoint() {
  const [points, setPoints] = useState([]);
  const db = getFirestore();
  const { userData } = useContext(UserInfoContext);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'divePoints'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let nickname = data.author;
          let levelIcon = '👤';
          if (data.authorUid) {
            const userRef = doc(db, 'users', data.authorUid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userInfo = userSnap.data();
              nickname = userInfo.nickname || data.author;
              levelIcon = userInfo.levelIcon || '👤';
            }
          }
          return {
            id: docSnap.id,
            ...data,
            nickname,
            levelIcon
          };
        })
      );
      setPoints(list);
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">🌍 다이브 포인트</h1>
        {userData?.admin && (
          <button
            onClick={() => navigate('/points/write')}
            className="bg-emerald-500 text-white px-3 py-1.5 text-sm rounded hover:bg-emerald-600"
          >
            포인트 등록
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-center border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-2 border w-12">번호</th>
              <th className="py-2 px-2 border w-24">지역</th>
              <th className="py-2 px-2 border w-32">리조트</th>
              <th className="py-2 px-2 border text-left w-[40%]">포인트명</th>
              <th className="py-2 px-2 border w-28">작성자</th>
              <th className="py-2 px-2 border w-28">작성일</th>
              <th className="py-2 px-2 border w-16">조회</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point, idx) => (
              <tr
                key={point.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/points/${point.id}`)}
              >
                <td className="py-2 px-2 border">{points.length - idx}</td>
                <td className="py-2 px-2 border">{point.region || '-'}</td>
                <td className="py-2 px-2 border">{point.resort || '-'}</td>
                <td className="py-2 px-2 border text-left truncate text-blue-700 underline">
                  {point.title}
                </td>
                <td className="py-2 px-2 border">
                  <span className="mr-1">{point.levelIcon}</span>
                  {point.nickname}
                </td>
                <td className="py-2 px-2 border">
                  {point.createdAt?.toDate().toLocaleDateString('ko-KR')}
                </td>
                <td className="py-2 px-2 border">{point.views || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
