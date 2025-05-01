import React, { useEffect, useState, useContext } from 'react';
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
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs, // ✅ 추가
} from 'firebase/firestore';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function TourDetail() {
  const { id } = useParams();
  const db = getFirestore();
  const navigate = useNavigate();
  const { user, userData } = useContext(UserInfoContext);
  const [tour, setTour] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [attendeeDetails, setAttendeeDetails] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const ref = doc(db, 'tourRequests', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setTour({ id: snap.id, ...data });
        await loadAttendeeDetails(data.attendees || []);
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

  const loadAttendeeDetails = async (attendees) => {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    const allUsers = snapshot.docs.map((doc) => doc.data());
    const matched = attendees.map((nickname) => {
      const found = allUsers.find((u) => u.nickname === nickname);
      return {
        nickname,
        name: found?.name || '',
        phone: found?.phone || '',
      };
    });
    setAttendeeDetails(matched);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addDoc(collection(db, 'tourRequests', id, 'comments'), {
      content: comment,
      author: userData?.nickname || user?.email || '익명',
      uid: user?.uid,
      createdAt: serverTimestamp(),
    });

    if (user?.uid && user.uid !== tour?.authorUid && tour?.authorUid) {
      await addDoc(collection(db, 'notifications'), {
        recipientUid: tour.authorUid,
        postId: id,
        boardType: 'tour',
        postTitle: tour.title || '투어 신청글',
        commentSnippet: comment.slice(0, 30),
        timestamp: serverTimestamp(),
        isRead: false,
      });
    }

    setComment('');
  };

  const handleJoinTour = async () => {
    if (!user) return alert('로그인이 필요합니다.');
    const ref = doc(db, 'tourRequests', id);
    await updateDoc(ref, {
      attendees: arrayUnion(userData?.nickname || user?.email || '익명'),
    });
    const updated = await getDoc(ref);
    setTour({ id: ref.id, ...updated.data() });
    await loadAttendeeDetails(updated.data().attendees || []);
  };

  const handleCancelJoin = async () => {
    if (!user) return;
    const nickname = userData?.nickname || user?.email || '익명';
    const ref = doc(db, 'tourRequests', id);
    await updateDoc(ref, {
      attendees: arrayRemove(nickname),
    });
    const updated = await getDoc(ref);
    setTour({ id: ref.id, ...updated.data() });
    await loadAttendeeDetails(updated.data().attendees || []);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'tourRequests', id, 'comments', commentId));
  };

  const handleDeleteTour = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'tourRequests', id));
      alert('삭제되었습니다.');
      navigate('/community/tour');
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류 발생');
    }
  };

  if (!tour) return <div className="text-center mt-10">로딩 중...</div>;

  const imageList = tour.imageUrls || tour.images || [];

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow text-base">
      <h2 className="text-3xl font-bold mb-6 text-center">📌 투어 신청 상세</h2>

      {/* 🗂️ 투어 정보 */}
      <h3 className="text-xl font-semibold mb-2 text-gray-700">🗂️ 투어 정보</h3>
      <div className="border rounded overflow-hidden mb-8">
        {[{ label: '신청자', value: tour.name }, { label: '등급', value: tour.level }, { label: '연락처', value: tour.phone }, { label: '투어 날짜', value: tour.date }, { label: '장소', value: tour.location }, { label: '구분', value: `${tour.region} / ${tour.overnight}` }, ...(tour.overnight === '숙박' ? [{ label: '숙박일수', value: tour.nights }] : []), { label: '인원수', value: tour.participants }, { label: '필요 등급', value: tour.requiredLevel }, { label: '필요 로그 수', value: tour.requiredLogs }, { label: '요청사항', value: tour.notes }].map((item, i) => (
          <div key={i} className="flex border-b last:border-none">
            <div className="w-40 bg-gray-100 px-4 py-2 font-medium text-gray-700 border-r">{item.label}</div>
            <div className="flex-1 px-4 py-2 text-gray-800">{item.value || '-'}</div>
          </div>
        ))}
      </div>

      {/* 지도 */}
      {(tour.coordinates || tour.location) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">📍 투어 위치</h3>
          <iframe
            title="투어 위치 지도"
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            className="rounded"
            src={
              tour.coordinates
                ? `https://www.google.com/maps/embed/v1/view?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&center=${tour.coordinates.lat},${tour.coordinates.lng}&zoom=14`
                : `https://maps.google.com/maps?q=${encodeURIComponent(tour.location)}&output=embed`
            }
          />
        </div>
      )}

      {/* 사진 */}
      {imageList.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">📷 장소 사진</h3>
          <div className="space-y-6">
            {imageList.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`투어 이미지 ${idx + 1}`}
                className="w-full object-contain rounded border shadow min-h-[100px]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/broken-image.png';
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 버튼들 */}
      <div className="flex justify-end gap-2 mt-6">
        {tour.authorUid === user?.uid && (
          <>
            <button onClick={() => navigate(`/tour/edit/${tour.id}`)} className="px-4 py-2 bg-yellow-300 text-sm rounded hover:bg-yellow-400">
              ✏️ 수정하기
            </button>
            <button onClick={handleDeleteTour} className="px-4 py-2 bg-red-300 text-sm rounded hover:bg-red-400">
              🗑️ 삭제
            </button>
          </>
        )}
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded border text-sm">
          🔙 돌아가기
        </button>
      </div>

      {/* 참석하기 버튼 */}
      <div className="relative mt-4 flex justify-end">
        <div className="group">
          <button
            onClick={handleJoinTour}
            className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold rounded w-[104px] h-[104px] transition-all duration-200"
          >
            🙋 참석하기
          </button>
          <div className="absolute right-0 mt-2 w-80 text-sm bg-yellow-100 text-gray-700 rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            해당 버튼을 누르면 원활한 투어진행을 위해<br />투어신청자에게 연락처가 공개됩니다.
          </div>
        </div>
      </div>

      {/* 참석자 명단 */}
      {attendeeDetails.length > 0 && (
        <div className="mt-10">
          <h3 className="text-base font-semibold mb-2">✅ 참석자 명단</h3>
          <ul className="text-sm text-gray-700">
            {attendeeDetails.map((person, i) => (
              <li key={i} className="flex items-center gap-2">
                <span>
                  • {tour.authorUid === user?.uid
                    ? `${person.name} (${person.nickname}) - ${person.phone}`
                    : person.nickname}
                </span>
                {person.nickname === userData?.nickname && (
                  <button onClick={handleCancelJoin} className="text-xs text-red-500 hover:underline">❌</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 댓글 */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">💬 댓글</h3>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="border border-gray-200 p-3 rounded">
              <div className="text-sm text-gray-600 mb-1 flex justify-between">
                <span>{c.author} · {c.createdAt?.toDate().toLocaleString()}</span>
                {user?.uid === c.uid && (
                  <button onClick={() => handleDeleteComment(c.id)} className="text-red-500 text-xs hover:underline">
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
