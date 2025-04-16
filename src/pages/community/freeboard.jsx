import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function FreeBoard() {
  const [posts, setPosts] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, 'community', 'free', 'posts'), orderBy('createdAt', 'desc'));
      const qSnap = await getDocs(q);
      const list = qSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(list);
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">📢 자유게시판</h1>
        <Link to="/community/free/write" className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600">
          새 글 작성
        </Link>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-center border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3 border">번호</th>
              <th className="py-2 px-3 border text-left">제목</th>
              <th className="py-2 px-3 border">작성자</th>
              <th className="py-2 px-3 border">작성일</th>
              <th className="py-2 px-3 border">추천</th>
              <th className="py-2 px-3 border">조회</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, idx) => (
              <tr key={post.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-3 border">{posts.length - idx}</td>
                <td className="py-2 px-3 border text-left">
                  <Link to={`/community/free/${post.id}`} className="text-sky-600 hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="py-2 px-3 border">{post.author}</td>
                <td className="py-2 px-3 border">
                  {post.createdAt?.toDate().toLocaleDateString('ko-KR')}
                </td>
                <td className="py-2 px-3 border">{post.likes || 0}</td>
                <td className="py-2 px-3 border">{post.views || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
