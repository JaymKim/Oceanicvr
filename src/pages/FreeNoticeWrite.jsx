// src/pages/FreeNoticeWrite.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function FreeNoticeWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, 'community', 'free', 'notice'), {
      title,
      content,
      createdAt: serverTimestamp(),
    });
    navigate('/free');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📢 공지사항 작성</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mb-3 p-2 border rounded h-48"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          등록하기
        </button>
      </form>
    </div>
  );
}
