import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export default function TourUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState('');
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !videoUrl) {
      return setMessage('제목과 영상 링크는 필수입니다.');
    }

    try {
      await addDoc(collection(db, 'tours'), {
        title,
        description,
        videoUrl,
        createdAt: new Date().toISOString(),
      });
      setMessage('✅ 업로드 완료!');
      setTitle('');
      setDescription('');
      setVideoUrl('');
    } catch (err) {
      setMessage(`❌ 오류 발생: ${err.message}`);
    }
  };

  // 유튜브 URL을 받아서 iframe을 렌더링하는 함수
  const renderVideo = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1]?.split('&')[0]; // 유튜브 URL에서 영상 ID 추출
    if (videoId) {
      return (
        <div className="mt-4">
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-sky-700">✍️ 해외투어 영상 업로드</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">영상 링크 (YouTube 또는 직접 URL)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded"
        >
          업로드
        </button>

        {message && <p className="mt-2 text-sm text-center text-sky-600">{message}</p>}
      </form>

      {renderVideo(videoUrl)} {/* 영상 출력 */}
    </div>
  );
}
