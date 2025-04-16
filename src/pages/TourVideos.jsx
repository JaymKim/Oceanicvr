// src/pages/TourVideos.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function TourVideos() {
  const [videos, setVideos] = useState([]);
  const db = getFirestore();
  const navigate = useNavigate();
  const { user, userData } = useContext(UserInfoContext);

  useEffect(() => {
    const fetchVideos = async () => {
      const q = query(collection(db, 'tourVideos'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(list);
    };
    fetchVideos();
  }, [db]);

  const handleVideoClick = (video) => {
    const confirm = window.confirm('이 영상을 보시겠습니까?\n(소리가 나올 수 있습니다)');
    if (confirm) {
      window.open(video.videoUrl, '_blank');
    }
  };

  const handleDelete = async (videoId) => {
    const confirm = window.confirm('정말 이 영상을 삭제하시겠습니까?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'tourVideos', videoId));
      setVideos(prev => prev.filter(video => video.id !== videoId));
      alert('삭제 완료!');
    } catch (err) {
      console.error('삭제 오류:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎬 투어 영상 갤러리</h1>
        <button
          onClick={() => navigate('/tour-videos/upload')}
          className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
        >
          ✍️ 영상 업로드
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map((video, index) => {
          const canDelete =
            (user?.uid && video.authorUid && user.uid === video.authorUid) ||
            (user?.email && video.author && user.email === video.author);

          return (
            <div
              key={video.id}
              className="border rounded shadow hover:shadow-lg relative"
            >
              <div
                className="aspect-video bg-black cursor-pointer"
                onClick={() => handleVideoClick(video)}
              >
                {video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') ? (
                  <img
                    src={`https://img.youtube.com/vi/${getYouTubeId(video.videoUrl)}/0.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm">
                    영상 미리보기 없음
                  </div>
                )}
              </div>

              <div className="p-3 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h2 className="text-blue-600 font-semibold text-lg truncate">
                    {videos.length - index}. {video.title}
                  </h2>
                </div>

                <p className="text-gray-600 text-sm truncate">{video.description}</p>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    공유일: {video.createdAt?.toDate?.().toLocaleString?.() || '날짜 없음'}
                  </p>
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(video.id);
                      }}
                      className="text-xs text-red-500 hover:underline ml-2 whitespace-nowrap"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getYouTubeId(url) {
  try {
    const yt = new URL(url);
    if (yt.hostname.includes('youtu.be')) return yt.pathname.slice(1);
    if (yt.hostname.includes('youtube.com')) return yt.searchParams.get('v');
    return '';
  } catch (e) {
    return '';
  }
}
