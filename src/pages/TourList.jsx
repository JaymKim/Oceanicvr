import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function TourList() {
  const [tours, setTours] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchTours = async () => {
      const querySnapshot = await getDocs(collection(db, 'tours'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTours(data);
    };
    fetchTours();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sky-700">🎥 해외 투어 영상 모음</h2>
        <Link
          to="/tours/upload"
          className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition"
        >
          + 영상 업로드
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tours.map(tour => (
          <div key={tour.id} className="bg-white rounded shadow p-4">
            <h3 className="text-lg font-semibold mb-2">{tour.title}</h3>
            {tour.videoUrl && tour.videoUrl.includes('youtube') ? (
              <iframe
                className="w-full aspect-video rounded"
                src={tour.videoUrl.replace('watch?v=', 'embed/')}
                title={tour.title}
                allowFullScreen
              ></iframe>
            ) : (
              <video controls className="w-full rounded">
                <source src={tour.videoUrl} type="video/mp4" />
                브라우저가 비디오를 지원하지 않습니다.
              </video>
            )}
            <p className="text-sm text-gray-500 mt-2">{tour.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
