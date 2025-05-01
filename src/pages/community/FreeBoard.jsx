import React, { useEffect, useState, useContext } from 'react';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  getCountFromServer,
  getDoc,
  doc,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function FreeBoard() {
  const [posts, setPosts] = useState([]);
  const [notice, setNotice] = useState(null);
  const db = getFirestore();
  const { userData, loading } = useContext(UserInfoContext);

  // 공지사항 불러오기
  useEffect(() => {
    if (loading) return;

    const fetchNotice = async () => {
      try {
        const noticeRef = doc(db, 'community', 'free', 'notice');
        const noticeSnap = await getDoc(noticeRef);
        if (noticeSnap.exists()) {
          setNotice(noticeSnap.data());
        }
      } catch (err) {
        console.error('공지사항 로딩 실패:', err);
      }
    };

    fetchNotice();
  }, [db, loading]);

  // 게시글 리스트 불러오기
  useEffect(() => {
    if (loading) return;

    const q = query(collection(db, 'community', 'free', 'posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const postsWithExtra = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            const commentsSnap = await getCountFromServer(
              collection(db, 'community', 'free', 'posts', docSnap.id, 'comments')
            );

            // levelIcon 및 nickname 가져오기
            let levelIcon = '👤';
            let nickname = data.author;
            if (data.authorUid) {
              try {
                const userRef = doc(db, 'users', data.authorUid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  levelIcon = userData.levelIcon || '👤';
                  nickname = userData.nickname || data.author;
                }
              } catch (err) {
                console.error('작성자 levelIcon 불러오기 실패:', err);
              }
            }

            return {
              id: docSnap.id,
              ...data,
              commentCount: commentsSnap.data().count || 0,
              levelIcon,
              nickname,
            };
          })
        );

        setPosts(postsWithExtra);
      } catch (err) {
        console.error('🔥 게시글 리스트 로딩 실패:', err);
      }
    });

    return () => unsubscribe();
  }, [db, loading]);

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold">📢 자유게시판</h1>
        <div className="flex gap-2">
          {userData?.admin && (
            <Link
              to="/free/notice"
              className="bg-yellow-400 text-white px-3 py-1.5 text-sm rounded hover:bg-yellow-500"
            >
              공지 작성
            </Link>
          )}
          <Link
            to="/community/free/write"
            className="bg-sky-500 text-white px-3 py-1.5 text-sm rounded hover:bg-sky-600"
          >
            새 글 작성
          </Link>
        </div>
      </div>

      {notice && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 shadow-sm rounded">
          <h3 className="text-sm font-bold text-yellow-800">📢 {notice.title}</h3>
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{notice.content}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-[0.95rem] leading-[1.8rem] text-center border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-2 border w-12">번호</th>
              <th className="py-2 px-2 border text-left w-[45%]">제목</th>
              <th className="py-2 px-2 border w-24">작성자</th>
              <th className="py-2 px-2 border w-28">작성일</th>
              <th className="py-2 px-2 border w-12">추천</th>
              <th className="py-2 px-2 border w-12">조회</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, idx) => (
              <tr key={post.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-2 border">{posts.length - idx}</td>
                <td className="py-2 px-2 border text-left truncate">
                  <Link to={`/community/free/${post.id}`} className="text-black hover:underline">
                    {post.title}
                    {post.images?.length > 0 && <span className="ml-1">📷</span>}
                    {post.commentCount > 0 && (
                      <span className="text-sky-600 font-semibold ml-1">
                        ({post.commentCount})
                      </span>
                    )}
                  </Link>
                </td>
                <td className="py-2 px-2 border truncate">
                  <span className="mr-1">{post.levelIcon}</span>
                  {post.nickname || post.author}
                </td>
                <td className="py-2 px-2 border">
                  {post.createdAt?.toDate().toLocaleDateString('ko-KR')}
                </td>
                <td className="py-2 px-2 border">{post.likes || 0}</td>
                <td className="py-2 px-2 border">{post.views || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
