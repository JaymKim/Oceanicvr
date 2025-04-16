// src/pages/TourGalleryList.jsx
import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function TourGalleryList() {
  const [videos, setVideos] = useState([]);
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      const q = query(collection(db, 'tourVideos'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(list);
    };
    fetchVideos();
  }, [db]);

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
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="border rounded shadow hover:shadow-lg cursor-pointer"
            onClick={() => window.open(video.videoUrl, '_blank')}
          >
            <div className="aspect-video bg-black">
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
            <div className="p-3">
              <h2 className="text-blue-600 font-semibold text-lg truncate">
                {videos.length - index}. {video.title}
              </h2>
              <p className="text-gray-600 text-sm truncate">{video.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                공유일: {video.createdAt?.toDate().toLocaleString() || '날짜 없음'}
              </p>
            </div>
          </div>
        ))}
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
