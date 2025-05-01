// src/pages/TourGalleryList.jsx
import React, { useEffect, useState, useContext } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function TourGalleryList() {
  const [videos, setVideos] = useState([]);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const db = getFirestore();
  const navigate = useNavigate();
  const { user } = useContext(UserInfoContext);

  useEffect(() => {
    const fetchVideos = async () => {
      const q = query(collection(db, 'tourVideos'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(list);
    };
    fetchVideos();
  }, [db]);

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'tourVideos', id));
      setVideos(prev => prev.filter(video => video.id !== id));
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const handleToggleDropdown = (id) => {
    setDropdownOpenId(prev => (prev === id ? null : id));
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
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="border rounded shadow hover:shadow-lg relative group"
          >
            <div className="aspect-video bg-black cursor-pointer" onClick={() => window.open(video.videoUrl, '_blank')}>
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
              {/* Dropdown 버튼 */}
              {user?.uid === video.authorUid && (
                <div className="absolute bottom-1 right-1">
                  <button
                    className="text-white text-xl bg-black/40 px-2 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDropdown(video.id);
                    }}
                  >
                    ⋯
                  </button>
                  {dropdownOpenId === video.id && (
                    <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10">
                      <button
                        onClick={() => navigate(`/tour-videos/edit/${video.id}`)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="block px-4 py-2 text-sm text-red-500 hover:bg-red-100 w-full text-left"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-3">
              <h2 className="text-blue-600 font-semibold text-lg truncate">
                {videos.length - index}. {video.title}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                작성자: {video.nickname || video.author} / {video.createdAt?.toDate().toLocaleString() || '날짜 없음'}
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