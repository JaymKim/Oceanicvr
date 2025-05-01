import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function DivePointDetail() {
  const { id } = useParams();
  const [point, setPoint] = useState(null);
  const db = getFirestore();
  const navigate = useNavigate();
  const { user, userData } = useContext(UserInfoContext);

  useEffect(() => {
    const fetchPoint = async () => {
      try {
        const ref = doc(db, 'divePoints', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setPoint(data);

          // 조회수 증가
          await updateDoc(ref, {
            views: (data.views || 0) + 1,
          });
        } else {
          alert('존재하지 않는 포인트입니다.');
          navigate('/points');
        }
      } catch (err) {
        console.error('포인트 로딩 실패:', err);
        alert('불러오는 중 오류가 발생했습니다.');
        navigate('/points');
      }
    };

    fetchPoint();
  }, [db, id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'divePoints', id));
        alert('삭제되었습니다.');
        navigate('/points');
      } catch (err) {
        console.error('삭제 실패:', err);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (!point) {
    return (
      <div className="text-center mt-20 text-gray-500">
        ⏳ 포인트 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h1 className="text-2xl font-bold mb-6">{point.title}</h1>

      {/* 정보 박스 */}
      <div className="bg-gray-50 border rounded p-4 mb-6 text-sm">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="font-semibold text-gray-700">📍 지역</div>
          <div className="col-span-2">{point.region}</div>

          <div className="font-semibold text-gray-700">🏨 리조트명</div>
          <div className="col-span-2">{point.resort || '정보 없음'}</div>

          <div className="font-semibold text-gray-700">🏷️ 포인트명</div>
          <div className="col-span-2">{point.title}</div>

          <div className="font-semibold text-gray-700">📏 수심</div>
          <div className="col-span-2">{point.depth || '정보 없음'}</div>
        </div>

        <div className="mt-4">
          <div className="font-semibold text-gray-700 mb-1">📝 설명</div>
          <div className="text-gray-800 whitespace-pre-line">{point.description}</div>
        </div>
      </div>

      {/* 위치 지도 */}
      {point.location && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-red-600">📌 위치</h3>
          <iframe
            title="Google Map"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(point.location)}&output=embed`}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            className="rounded"
          />
        </div>
      )}

      {/* 이미지들 */}
      {point.imageUrls?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">📸 업로드된 사진</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {point.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`포인트 이미지 ${index + 1}`}
                className="w-full rounded shadow border object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* 작성자 & 조회수 */}
      <div className="text-sm text-gray-500 border-t pt-4 flex justify-between">
        <div>
          작성자: <span className="mr-1">{point.levelIcon}</span>
          {point.nickname || point.author}
        </div>
        <div>조회수: {point.views}</div>
      </div>

      {/* 수정 및 삭제 버튼 */}
      {(point.authorUid === user?.uid || userData?.admin) && (
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => navigate(`/points/edit/${id}`)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
