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
    try {
      await setDoc(doc(db, 'community', 'free', 'notice'), {
        title,
        content,
        createdAt: serverTimestamp(),
      });
      alert('공지사항이 등록되었습니다.');
      navigate('/community/free');
    } catch (err) {
      console.error('공지 작성 실패:', err);
      alert('공지 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-6">📢 공지사항 작성</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="공지 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 p-3 border rounded text-base"
          required
        />
        <textarea
          placeholder="공지 내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mb-4 p-3 border rounded h-48 text-base"
          required
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            취소
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
}
