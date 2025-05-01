import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function TourVideosEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  const { user } = useContext(UserInfoContext);

  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, 'tourVideos', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (user?.uid !== data.authorUid) {
          alert('작성자만 수정할 수 있습니다.');
          navigate('/tour-videos');
          return;
        }
        setVideo(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setVideoUrl(data.videoUrl || '');
      } else {
        alert('영상이 존재하지 않습니다.');
        navigate('/tour-videos');
      }
    };
    fetchData();
  }, [db, id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'tourVideos', id), {
        title,
        description,
        videoUrl,
      });
      alert('수정 완료!');
      navigate('/tour-videos'); // ✅ 수정 후 목록으로 이동
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정 중 오류 발생');
    }
  };

  if (!video) return <div className="text-center mt-10">로딩 중...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-sky-700">✏️ 투어 영상 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          required
          className="w-full border rounded p-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="설명"
          className="w-full border rounded p-2 min-h-[100px]"
        />
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="YouTube 링크"
          className="w-full border rounded p-2"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
