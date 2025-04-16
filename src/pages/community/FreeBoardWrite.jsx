import React, { useState, useContext } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function FreeBoardWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();
  const { user, userData } = useContext(UserInfoContext);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('이미지는 최대 5장까지 업로드할 수 있습니다.');
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        images.map(async (image) => {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressed = await imageCompression(image, options);
          const storageRef = ref(storage, `freeboard/${Date.now()}_${image.name}`);
          await uploadBytes(storageRef, compressed);
          return await getDownloadURL(storageRef);
        })
      );

      await addDoc(collection(db, 'community', 'free', 'posts'), {
        title,
        content,
        images: imageUrls,
        author: userData.nickname, // ✅ 닉네임 저장
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        views: 0,
      });

      alert('작성 완료!');
      navigate('/community/free');
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('작성 중 오류가 발생했습니다.');
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

        {/* 이미지 업로드 */}
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
              <div key={idx} className="text-sm text-gray-600">
                📷 {img.name}
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
