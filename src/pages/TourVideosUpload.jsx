// src/pages/TourVideosUpload.jsx
import React, { useState, useContext } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function TourVideosUpload() {
  const { user, userData } = useContext(UserInfoContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const db = getFirestore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !videoUrl) {
      alert('제목과 영상 링크를 입력해주세요.');
      return;
    }

    try {
      await addDoc(collection(db, 'tourVideos'), {
        title,
        description,
        videoUrl,
        createdAt: serverTimestamp(),
        authorUid: user?.uid || '',
        author: user?.email || '',
        nickname: userData?.nickname || user?.displayName || '익명',
      });

      setSuccess(true);
      setTimeout(() => navigate('/tour-videos'), 2000);
    } catch (err) {
      console.error(err);
      alert('업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">✍️ 해외투어 영상 업로드</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2 min-h-[100px]"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">영상 링크 (YouTube 또는 직접 URL)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded"
        >
          업로드
        </button>

        {success && (
          <p className="text-green-600 flex items-center mt-2">
            <span className="text-xl mr-2">✅</span> 업로드 완료!
          </p>
        )}
      </form>
    </div>
  );
}