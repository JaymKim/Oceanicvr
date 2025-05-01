import React, { useState, useContext } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { UserInfoContext } from '../../contexts/UserInfoContext';

const getLevelIcon = (level) => {
  switch (level) {
    case 'OpenWater': return '🅞';
    case 'Advance': return '🅐';
    case 'Rescue': return '🅡';
    case 'DiveMaster': return '🅜';
    case 'Instructor': return '🅘';
    case 'Trainer': return '🅣';
    default: return '👤';
  }
};

export default function FreeBoardWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();
  const { user, userData, loading } = useContext(UserInfoContext);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('이미지는 최대 5장까지 업로드할 수 있습니다.');
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      alert('사용자 정보를 불러오는 중입니다. 잠시만 기다려 주세요.');
      return;
    }

    if (!user || !userData?.nickname) {
      alert('로그인 또는 닉네임 정보가 없습니다.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력하세요');
      return;
    }

    try {
      const imageUrls = await Promise.all(
        images.map(async (image, idx) => {
          try {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            const compressed = await imageCompression(image, options);
            const safeName = encodeURIComponent(image.name.replace(/\s+/g, '_'));
            const storageRef = ref(storage, `freeboard/${Date.now()}_${safeName}`);

            console.log(`📤 [${idx + 1}] Uploading: ${storageRef.fullPath}`);
            await uploadBytes(storageRef, compressed);
            const url = await getDownloadURL(storageRef);
            console.log(`✅ [${idx + 1}] Uploaded URL:`, url);

            return url;
          } catch (imgErr) {
            console.error(`❌ 이미지 업로드 실패 (${image.name}):`, imgErr);
            throw imgErr;
          }
        })
      );

      const postData = {
        title,
        content,
        images: imageUrls,
        author: userData.nickname,
        level: userData.level || '',
        levelIcon: getLevelIcon(userData.level),
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        views: 0,
      };

      console.log('📝 저장될 게시글 데이터:', postData);

      await addDoc(collection(db, 'community', 'free', 'posts'), postData);

      alert('작성 완료!');
      navigate('/community/free');
    } catch (error) {
      console.error('🔥 전체 업로드 오류:', error);
      alert('작성 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">✍️ 새 글 작성</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded space-y-4">
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border rounded min-h-[150px]"
          required
        />

        <div>
          <label className="block mb-2 font-semibold">사진 업로드 (최대 5장, 1MB 이하):</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative border p-2 rounded bg-gray-50 text-sm text-gray-700">
                📷 {img.name}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-0 right-0 text-red-500 font-bold px-2"
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          작성
        </button>
      </form>
    </div>
  );
}
