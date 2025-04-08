// src/pages/community/FreeBoard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function FreeBoard() {
  const [posts, setPosts] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchPosts = async () => {
      const snapshot = await getDocs(collection(db, 'freePosts')); // ✅ 'freePosts' 라는 컬렉션 사용
      const postData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postData);
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">📝 자유게시판</h2>

      <Link to="/community/free/new" className="mb-4 inline-block bg-sky-500 text-white py-2 px-4 rounded hover:bg-sky-600">
        ✍️ 글쓰기
      </Link>

      <ul className="space-y-4">
        {posts.map(post => (
          <li key={post.id} className="p-4 border rounded hover:bg-gray-50">
            <Link to={`/community/free/${post.id}`} className="text-lg font-semibold text-sky-600 hover:underline">
              {post.title}
            </Link>
            <p className="text-sm text-gray-600">작성자: {post.author}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
