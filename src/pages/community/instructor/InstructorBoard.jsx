// src/pages/InstructorBoard.jsx
import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  getCountFromServer,
  getDoc,
  doc
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function InstructorBoard() {
  const [posts, setPosts] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const q = query(collection(db, 'community', 'instructor', 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsWithExtras = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          // 댓글 수
          const commentsSnap = await getCountFromServer(
            collection(db, 'community', 'instructor', 'posts', docSnap.id, 'comments')
          );

          // 작성자 levelIcon
          let levelIcon = '';
          if (data.authorUid) {
            try {
              const userRef = doc(db, 'users', data.authorUid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                levelIcon = userSnap.data().levelIcon || '👤';
              }
            } catch (err) {
              console.error('작성자 levelIcon 로딩 실패:', err);
            }
          }

          return {
            id: docSnap.id,
            ...data,
            commentCount: commentsSnap.data().count || 0,
            levelIcon
          };
        })
      );
      setPosts(postsWithExtras);
    });
    return () => unsubscribe();
  }, [db]);

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <div className="flex justify-between mb-3">
        <h1 className="text-xl font-bold">🎓 Instructor 게시판</h1>
        <Link
          to="/instructor/write"
          className="bg-sky-500 text-white px-3 py-1.5 text-sm rounded hover:bg-sky-600"
        >
          새 글 작성
        </Link>
      </div>

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
                  <Link to={`/instructor/${post.id}`} className="text-black hover:underline">
                    {post.title}{' '}
                    {post.images && post.images.length > 0 && (
                      <span className="ml-1">📷</span>
                    )}
                    {post.commentCount > 0 && (
                      <span className="text-sky-600 font-semibold ml-1">
                        ({post.commentCount})
                      </span>
                    )}
                  </Link>
                </td>
                <td className="py-2 px-2 border truncate">
                  {post.levelIcon || '👤'} {post.nickname || post.author}
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