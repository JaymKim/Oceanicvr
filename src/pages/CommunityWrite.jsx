// src/pages/CommunityWrite.jsx
import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { useContext } from 'react';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function CommunityWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { user, userData } = useContext(UserInfoContext);
  const db = getFirestore();
  const storage = getStorage();

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const resizeImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert('제목과 내용을 입력해주세요.');
    if (!user) return alert('로그인이 필요합니다.');

    setUploading(true);
    try {
      const imageUrls = [];

      for (const file of images) {
        const resized = await resizeImage(file);
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, resized);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      }

      await addDoc(collection(db, 'posts'), {
        title,
        content,
        images: imageUrls,
        author: user.email,
        createdAt: serverTimestamp(),
      });

      alert('게시물이 등록되었습니다!');
      navigate('/community');
    } catch (err) {
      console.error(err);
      alert('업로드 실패!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">✏️ 커뮤니티 글쓰기</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded min-h-[150px]"
            required
          />
        </div>
        <div>
          <label className="block font-medium">이미지 업로드 (여러 개 가능)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded"
        >
          {uploading ? '업로드 중...' : '글 작성'}
        </button>
      </form>
    </div>
  );
}
