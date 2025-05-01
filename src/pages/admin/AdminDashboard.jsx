// ✅ 관리자 대시보드 전체코드 (사이트 통계 + 모든 게시판 목록 + 회원 목록)

import React, { useEffect, useState, useContext } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  getCountFromServer,
  where
} from 'firebase/firestore';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function AdminDashboard() {
  const { userData, loading } = useContext(UserInfoContext);
  const db = getFirestore();

  const [freePosts, setFreePosts] = useState([]);
  const [qnaPosts, setQnaPosts] = useState([]);
  const [tourRequests, setTourRequests] = useState([]);
  const [galleryPosts, setGalleryPosts] = useState([]);
  const [videoPosts, setVideoPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [divePoints, setDivePoints] = useState([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [todayUsers, setTodayUsers] = useState(0);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const freeSnapshot = await getDocs(query(collection(db, 'community/free/posts'), orderBy('createdAt', 'desc')));
        const qnaSnapshot = await getDocs(query(collection(db, 'community/qna/posts'), orderBy('createdAt', 'desc')));
        const tourSnapshot = await getDocs(query(collection(db, 'tourRequests'), orderBy('createdAt', 'desc')));
        const gallerySnapshot = await getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')));
        const videoSnapshot = await getDocs(query(collection(db, 'tourVideos'), orderBy('createdAt', 'desc')));
        const diveSnapshot = await getDocs(query(collection(db, 'divePoints'), orderBy('createdAt', 'desc')));
        const userSnapshot = await getDocs(query(collection(db, 'users')));

        setFreePosts(freeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setQnaPosts(qnaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setTourRequests(tourSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setGalleryPosts(gallerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setVideoPosts(videoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setDivePoints(diveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setUsers(userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('🔥 데이터 불러오기 오류:', err);
      }
    };

    const fetchStats = async () => {
      try {
        const statsSnap = await getDocs(collection(db, 'stats'));
        if (!statsSnap.empty) {
          const siteStats = statsSnap.docs[0].data();
          setVisitorCount(siteStats.visitorCount || 0);
        }

        const usersSnap = await getCountFromServer(collection(db, 'users'));
        setTotalUsers(usersSnap.data().count || 0);

        const postsSnap = await getCountFromServer(collection(db, 'community/free/posts'));
        setTotalPosts(postsSnap.data().count || 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayQuery = query(collection(db, 'users'), where('createdAt', '>=', today));
        const todaySnap = await getCountFromServer(todayQuery);
        setTodayUsers(todaySnap.data().count || 0);
      } catch (err) {
        console.error('🔥 사이트 통계 로딩 실패:', err);
      }
    };

    if (userData?.admin && !loading) {
      fetchAllData();
      fetchStats();
    }
  }, [db, userData, loading]);

  const deleteItem = async (colPath, id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, colPath, id));
    alert('삭제되었습니다.');
    window.location.reload();
  };

  const deleteUser = async (uid) => {
    if (!window.confirm('이 회원을 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'users', uid));
    alert('회원이 삭제되었습니다.');
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-10">🛠️ 관리자 대시보드</h1>

      {/* 🔐 사이트 통계 */}
      <div className="bg-yellow-100 border border-yellow-400 p-6 rounded-lg shadow text-center mb-10">
        <h2 className="text-xl font-bold text-yellow-800 mb-6">🔐 사이트 통계</h2>
        <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm mb-6">
          <div onClick={() => setShowMembers(prev => !prev)} className="bg-white p-3 rounded shadow cursor-pointer hover:bg-gray-50 transition">
            👥 전체 회원 수
            <div className="text-lg font-bold mt-1">{totalUsers}명</div>
          </div>
          <div className="bg-white p-3 rounded shadow">📝 전체 게시글 수<div className="text-lg font-bold mt-1">{totalPosts}건</div></div>
          <div className="bg-white p-3 rounded shadow col-span-2">📈 오늘 가입자 수<div className="text-lg font-bold mt-1">{todayUsers}명</div></div>
          <div className="bg-white p-3 rounded shadow col-span-2">🌎 전체 방문자 수<div className="text-lg font-bold mt-1">{visitorCount.toLocaleString()}회</div></div>
        </div>
        {showMembers && (
          <div className="bg-white rounded border p-4 text-left max-h-[400px] overflow-y-auto transition-all duration-300 mt-4">
            <h3 className="text-base font-semibold mb-2">👤 전체 회원 목록</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {users.map(user => (
                <div key={user.id} className="border rounded shadow-sm p-3 text-sm bg-white">
                  <p><strong>이름:</strong> {user.name || '-'}</p>
                  <p><strong>닉네임:</strong> {user.nickname}</p>
                  <p><strong>생년월일:</strong> {user.birthdate}</p>
                  <p><strong>다이브 단체:</strong> {user.agency}</p>
                  <p><strong>등급:</strong> {user.level}</p>
                  <p className="truncate whitespace-nowrap overflow-hidden text-ellipsis">
                    <strong>이메일:</strong> {user.email}
                  </p>
                  <p><strong>가입일:</strong> {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '-'}</p>

                  {!user.admin && (
                    <button
                      className="bg-red-500 text-white text-xs px-3 py-1 mt-2 rounded w-full"
                      onClick={() => deleteUser(user.id)}
                    >
                      회원삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔽 게시판 목록들 */}
      <Section title="📋 자유게시판 목록" color="text-yellow-700" posts={freePosts} path="community/free/posts" />
      <Section title="💡 QnA 게시글 목록" color="text-emerald-600" posts={qnaPosts} path="community/qna/posts" />
      <Section title="🚩 투어 신청 목록" color="text-pink-600" posts={tourRequests} path="tourRequests" titleField="location" fallback="(장소 미입력)" />
      <Section title="🌅 갤러리 게시글 목록" color="text-purple-600" posts={galleryPosts} path="gallery" />
      <Section title="🎬 투어 영상 목록" color="text-gray-700" posts={videoPosts} path="tourVideos" authorField />
      <Section title="📍 다이브포인트 목록" color="text-blue-600" posts={divePoints} path="divePoints" />
    </div>
  );

  function Section({ title, color, posts, path, titleField = 'title', fallback = '제목없음', authorField = false }) {
    return (
      <section className="mb-8">
        <h2 className={`text-lg font-semibold ${color} mb-3`}>{title}</h2>
        {posts.map(post => (
          <div key={post.id} className="flex justify-between items-center p-2 border rounded mb-1 bg-white text-sm">
            <div>
              <div className="font-medium">{post[titleField] || fallback}</div>
              <div className="text-xs text-gray-500">
                {new Date(post.createdAt?.seconds * 1000).toLocaleString()} | 작성자: {post.nickname || post.name || (authorField ? post.author : '익명')}
              </div>
            </div>
            <button className="bg-red-500 text-white text-xs px-3 py-1 rounded" onClick={() => deleteItem(path, post.id)}>삭제</button>
          </div>
        ))}
      </section>
    );
  }
}
