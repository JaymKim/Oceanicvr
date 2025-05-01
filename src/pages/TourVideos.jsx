import React, { useEffect, useState, useContext } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  increment,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function TourVideos() {
  const [videos, setVideos] = useState([]);
  const db = getFirestore();
  const navigate = useNavigate();
  const { user } = useContext(UserInfoContext);

  useEffect(() => {
    const fetchVideos = async () => {
      const q = query(collection(db, 'tourVideos'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        no: snapshot.size - index,
        ...doc.data(),
      }));
      setVideos(list);
    };
    fetchVideos();
  }, [db]);

  const handleLike = async (video) => {
    if (!user?.uid) return;
    if (video.likedBy?.includes(user.uid)) {
      alert('이미 추천하셨습니다.');
      return;
    }
    const videoRef = doc(db, 'tourVideos', video.id);
    await updateDoc(videoRef, {
      likes: increment(1),
      likedBy: [...(video.likedBy || []), user.uid],
    });
    setVideos((prev) =>
      prev.map((v) =>
        v.id === video.id
          ? { ...v, likes: (v.likes || 0) + 1, likedBy: [...(v.likedBy || []), user.uid] }
          : v
      )
    );
  };

  const handleEdit = (videoId) => {
    navigate(`/tour-videos/edit/${videoId}`);
  };

  const handleDelete = async (videoId) => {
    const ok = window.confirm('정말 이 영상을 삭제하시겠습니까?');
    if (!ok) return;
    await deleteDoc(doc(db, 'tourVideos', videoId));
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎬 Tour Videos (Youtube)</h1>
        <button
          onClick={() => navigate('/tour-videos/upload')}
          className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
        >
          ✍️ 영상 업로드
        </button>
      </div>

      <table className="w-full text-sm border-t border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 w-[50px]">번호</th>
            <th className="p-2 w-[100px]">썸네일</th>
            <th className="p-2 w-[180px]">제목</th>
            <th className="p-2 w-[120px]">작성자</th>
            <th className="p-2 w-[180px]">날짜</th>
            <th className="p-2 w-[100px]">추천</th>
            <th className="p-2 w-[100px]">관리</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => {
            const canModify =
              (user?.uid && video.authorUid === user.uid) ||
              (user?.email && video.author === user.email);
            return (
              <tr key={video.id} className="border-t hover:bg-gray-50">
                <td className="p-2 text-center">{video.no}</td>
                <td className="p-2">
                  <img
                    src={`https://img.youtube.com/vi/${getYouTubeId(video.videoUrl)}/0.jpg`}
                    alt="썸네일"
                    className="w-20 h-12 object-cover rounded cursor-pointer"
                    onClick={() => {
                      const ok = window.confirm('이 영상을 유튜브에서 보시겠습니까?\n(🔊 소리가 나올 수 있습니다)');
                      if (ok) {
                        window.open(video.videoUrl, '_blank');
                      }
                    }}
                  />
                </td>
                <td className="p-2">
                  <span
                    className="font-medium text-blue-600 hover:underline cursor-help"
                    title={video.description || '설명 없음'}
                  >
                    {video.title}
                  </span>
                </td>
                <td className="p-2">{video.nickname || video.author}</td>
                <td className="p-2 whitespace-nowrap">{video.createdAt?.toDate?.().toLocaleString?.() || '날짜 없음'}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleLike(video)}
                    className="text-xs text-gray-700 hover:text-blue-600"
                  >
                    👍 {video.likes || 0}
                  </button>
                </td>
                <td className="p-2 text-center">
                  {canModify && (
                    <>
                      <button
                        onClick={() => handleEdit(video.id)}
                        className="text-xs text-green-600 hover:underline mr-2"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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