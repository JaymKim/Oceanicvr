// src/pages/CommunityList.jsx
import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

export default function CommunityList() {
  const [posts, setPosts] = useState([]);
  const db = getFirestore();
  const navigate = useNavigate(); // ✅ 글쓰기 버튼용

  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📋 커뮤니티 글 목록</h2>
        <button
          onClick={() => navigate('/community/new')}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded"
        >
          ✏️ 글쓰기
        </button>
      </div>

      <ul className="space-y-4">
        {posts.map(post => (
          <li key={post.id} className="p-4 border rounded hover:bg-gray-100">
            <Link to={`/community/${post.id}`} className="text-lg font-semibold text-sky-600 hover:underline">
              {post.title || '제목 없음'}
            </Link>
            <p className="text-sm text-gray-600">작성자: {post.author || '알 수 없음'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
