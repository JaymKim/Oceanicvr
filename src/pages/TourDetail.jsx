// src/pages/TourDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { UserInfoContext } from '../contexts/UserInfoContext';
import { useContext } from 'react';

export default function TourDetail() {
  const { id } = useParams();
  const db = getFirestore();
  const navigate = useNavigate();
  const { user, userData } = useContext(UserInfoContext);
  const [tour, setTour] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const ref = doc(db, 'tourRequests', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setTour({ id: snap.id, ...snap.data() });
      } else {
        alert('신청 데이터를 찾을 수 없습니다.');
        navigate('/community/tour');
      }
    };
    fetch();
  }, [db, id, navigate]);

  useEffect(() => {
    const q = query(collection(db, 'tourRequests', id, 'comments'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(commentData);
    });
    return () => unsubscribe();
  }, [db, id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addDoc(collection(db, 'tourRequests', id, 'comments'), {
      content: comment,
      author: userData?.nickname || user?.email || '익명',
      uid: user?.uid,
      createdAt: serverTimestamp(),
    });

    setComment('');
  };

  const handleJoinTour = async () => {
    if (!user) return alert('로그인이 필요합니다.');

    await addDoc(collection(db, 'tourRequests', id, 'comments'), {
      content: '투어신청합니다.',
      author: userData?.nickname || user?.email || '익명',
      uid: user?.uid,
      createdAt: serverTimestamp(),
    });
  };

  const handleDeleteComment = async (commentId) => {
    const confirm = window.confirm('댓글을 삭제하시겠습니까?');
    if (!confirm) return;
    await deleteDoc(doc(db, 'tourRequests', id, 'comments', commentId));
  };

  if (!tour) return <div className="text-center mt-10">로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">📌 투어 신청 상세</h2>

      <div className="space-y-2 text-sm">
        <p><strong>🧍‍♂️ 신청자:</strong> {tour.name || '-'}</p>
        <p><strong>📛 신청자 등급:</strong> {tour.level || '-'}</p>
        <p><strong>📞 연락처:</strong> {tour.phone || '-'}</p>
        <p><strong>📅 투어 날짜:</strong> {tour.date || '-'}</p>
        <p><strong>📍 장소:</strong> {tour.location || '-'}</p>
        <p><strong>🌏 투어 구분:</strong> {tour.region || '-'} / {tour.overnight || '-'}</p>
        {tour.overnight === '숙박' && (
          <p><strong>🛏 숙박일수:</strong> {tour.nights || '-'}</p>
        )}
        <p><strong>👥 인원수:</strong> {tour.participants || '-'}</p>
        <p><strong>🪪 필요 등급:</strong> {tour.requiredLevel || '-'}</p>
        <p><strong>📘 필요 로그 수:</strong> {tour.requiredLogs || '-'}</p>
        {tour.requestNote && (
          <p><strong>📩 요청사항:</strong> {tour.requestNote}</p>
        )}
      </div>

      {tour.images && tour.images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">📷 장소 사진</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tour.images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`투어 이미지 ${idx + 1}`}
                className="w-full h-40 object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-right">
        <button
          onClick={handleJoinTour}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          ✋ 투어 참석하기
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded border"
        >
          🔙 돌아가기
        </button>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">💬 댓글</h3>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="border border-gray-200 p-3 rounded">
              <div className="text-sm text-gray-600 mb-1 flex justify-between">
                <span>{c.author} · {c.createdAt?.toDate().toLocaleString()}</span>
                {user?.uid === c.uid && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    삭제
                  </button>
                )}
              </div>
              <div>{c.content}</div>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mt-4 space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="w-full p-2 border rounded min-h-[80px]"
            />
            <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded">
              댓글 작성
            </button>
          </form>
        ) : (
          <p className="text-gray-500 text-sm mt-4">※ 로그인 후 댓글을 작성할 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
