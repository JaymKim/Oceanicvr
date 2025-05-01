import React, { useState, useEffect, useContext } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(UserInfoContext);
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
    <div className="w-full min-h-screen bg-gray-500">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">📸 갤러리</h1>
          <button
            onClick={() => navigate('/gallery/upload')}
            className="bg-gray-800 text-white px-4 py-2 rounded border border-white/30 
                       shadow-md transition-all duration-150 
                       active:translate-y-[2px] active:shadow-inner"
          >
            사진 업로드
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-200">이미지를 불러오는 중입니다...</div>
        ) : photos.length === 0 ? (
          <div className="text-center text-gray-300">업로드된 이미지가 없습니다.</div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group rounded-lg overflow-hidden shadow-lg border border-gray-300 bg-white hover:shadow-xl cursor-pointer transition"
                onClick={() => navigate(`/gallery/${photo.id}`)}
              >
                <img
                  src={photo.url || photo.images?.[0]}
                  alt={photo.title}
                  className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3 text-xs">
                  <h3 className="text-sm font-semibold truncate">{photo.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span>
                      {photo.levelIcon || '👤'} {photo.nickname || photo.author}
                    </span>
                  </div>
                  <div className="flex justify-end text-[11px] text-gray-300 mt-1">
                    👍 {photo.likes || 0}
                  </div>
                  <div className="flex justify-end text-[11px] text-gray-400">
                    {photo.createdAt?.toDate().toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
