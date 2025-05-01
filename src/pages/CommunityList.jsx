// src/pages/community/CommunityList.jsx
import React, { useEffect, useState, useContext } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function CommunityList() {
  const [posts, setPosts] = useState([]);
  const db = getFirestore();
  const navigate = useNavigate();
  const { userData } = useContext(UserInfoContext);

  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    };
    fetchPosts();
  }, [db]);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('삭제 오류:', err);
      alert('삭제 중 오류 발생');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📋 자유게시판</h2>
        <button
          onClick={() => navigate('/community/free/write')}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded"
        >
          ✏️ 새 글 작성
        </button>
      </div>

      <table className="w-full table-auto border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 border">번호</th>
            <th className="p-2 border">제목</th>
            <th className="p-2 border">작성자</th>
            <th className="p-2 border">작성일</th>
            <th className="p-2 border">추천</th>
            <th className="p-2 border">조회</th>
            {userData?.admin && <th className="p-2 border">관리</th>}
          </tr>
        </thead>
        <tbody>
          {posts
            .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
            .map((post, index) => (
              <tr key={post.id} className="text-center border-b hover:bg-gray-50">
                <td className="p-2 border">{posts.length - index}</td>
                <td className="p-2 border text-left">
                  <Link
                    to={`/community/free/${post.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {post.title || '제목 없음'}
                  </Link>
                </td>
                <td className="p-2 border">{post.author || '익명'}</td>
                <td className="p-2 border">
                  {post.createdAt?.toDate().toLocaleDateString() || '-'}
                </td>
                <td className="p-2 border">{post.likes || 0}</td>
                <td className="p-2 border">{post.views || 0}</td>
                {userData?.admin && (
                  <td className="p-2 border">
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      삭제
                    </button>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
