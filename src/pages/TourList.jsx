import React, { useEffect, useState, useContext } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext'; // 🔧 경로 수정: src 내부로

export default function TourList() {
  const [tours, setTours] = useState([]);
  const db = getFirestore();
  const navigate = useNavigate();
  const { user } = useContext(UserInfoContext);

  useEffect(() => {
    const fetchTours = async () => {
      const q = query(collection(db, 'tourRequests'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTours(list);
    };
    fetchTours();
  }, [db]);

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🌊 투어 신청 리스트</h1>
        <button
          onClick={() => navigate('/community/tour/request')}
          className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
        >
          ✍️ 투어 신청
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-center border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3 border">번호</th>
              <th className="py-2 px-3 border">투어 날짜</th>
              <th className="py-2 px-3 border">장소</th>
              <th className="py-2 px-3 border">신청자</th>
              <th className="py-2 px-3 border">등급</th>
              <th className="py-2 px-3 border">인원</th>
              <th className="py-2 px-3 border">참여자</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour, idx) => (
              <tr
                key={tour.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/community/tour/${tour.id}`)}
              >
                <td className="py-2 px-3 border">{tours.length - idx}</td>
                <td className="py-2 px-3 border">{tour.date || '-'}</td>
                <td className="py-2 px-3 border">{tour.location || '-'}</td>
                <td className="py-2 px-3 border">{tour.name || '-'}</td>
                <td className="py-2 px-3 border">{tour.level || '-'}</td>
                <td className="py-2 px-3 border">{tour.participants || '-'}</td>
                <td className="py-2 px-3 border">
                  {tour.attendees ? tour.attendees.length : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
