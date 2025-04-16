// src/pages/Gallery.jsx
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import GalleryModal from '../components/GalleryModal';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("📷 불러온 사진:", list);
        setPhotos(list);
        setLoading(false);
      },
      (error) => {
        console.error('🔥 Firestore 에러:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-sky-700">📸 갤러리</h1>
        <button
          onClick={() => navigate('/gallery/upload')}
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
        >
          사진 업로드
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">이미지를 불러오는 중입니다...</div>
      ) : photos.length === 0 ? (
        <div className="text-center text-gray-400">업로드된 이미지가 없습니다.</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden shadow hover:shadow-lg cursor-pointer transition"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url || photo.images?.[0]}
                alt={photo.title}
                className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3">
                <h3 className="text-sm font-semibold truncate">{photo.title}</h3>
                {photo.hashtags?.length > 0 && (
                  <div className="text-xs text-blue-300 mt-1 truncate">
                    {photo.hashtags.map((tag, idx) => (
                      <span key={idx} className="mr-1">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 모달 */}
      {selectedPhoto && (
        <div className="animate-fade-in-out">
          <GalleryModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        </div>
      )}
    </div>
  );
}

/* tailwind.config.js에 아래 animation 추가 필요
  theme: {
    extend: {
      keyframes: {
        'fade-in-out': {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'fade-out': {
          '0%': { opacity: 1, transform: 'scale(1)' },
          '100%': { opacity: 0, transform: 'scale(0.95)' },
        },
      },
      animation: {
        'fade-in-out': 'fade-in-out 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-in',
      },
    },
  },
*/
