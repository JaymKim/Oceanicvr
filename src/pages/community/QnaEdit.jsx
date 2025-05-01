// src/pages/community/QnaEdit.jsx

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function QnaEdit() {
  const { id } = useParams();
  const db = getFirestore();
  const navigate = useNavigate();
  const { user } = useContext(UserInfoContext);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const ref = doc(db, 'community', 'qna', 'posts', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.authorUid !== user?.uid) {
          alert('수정 권한이 없습니다.');
          navigate(-1);
        }
        setTitle(data.title);
        setContent(data.content);
      } else {
        alert('게시글을 찾을 수 없습니다.');
        navigate(-1);
      }
    };
    fetch();
  }, [db, id, navigate, user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('제목과 내용을 입력해주세요.');
    try {
      const ref = doc(db, 'community', 'qna', 'posts', id);
      await updateDoc(ref, { title, content });
      alert('수정이 완료되었습니다.');
      navigate(`/community/qna/${id}`);
    } catch (err) {
      console.error('수정 오류:', err);
      alert('수정 중 오류 발생');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">✏️ 질문 수정</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded min-h-[200px]"
          required
        />
        <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600">
          수정 완료
        </button>
      </form>
    </div>
  );
}