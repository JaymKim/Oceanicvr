// src/pages/CommunityWrite.jsx
import React, { useState, useEffect, useContext } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const sanitizeFilename = (filename) => {
    return encodeURIComponent(filename.replace(/\s+/g, '_').replace(/[^\w.\-]/gi, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setUploading(true);
    try {
      const imageUrls = [];

      for (const file of images) {
        try {
          const safeName = sanitizeFilename(file.name);
          const path = `freeboard/${Date.now()}_${safeName}`;
          const storageRef = ref(storage, path);

          console.log('이미지 업로드 시작:', path);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          console.log('업로드 완료:', url);

          imageUrls.push(url);
        } catch (imgErr) {
          console.error('🔥 이미지 업로드 실패:', imgErr);
          alert(`🔥 이미지 업로드 실패: ${file.name}\n에러내용: ${imgErr.message}`);
          setUploading(false);
          return;
        }
      }

      await addDoc(collection(db, 'posts'), {
        title,
        content,
        images: imageUrls,
        author: user.email,
        nickname: userData?.nickname || '익명',
        levelIcon: userData?.levelIcon || '',
        createdAt: serverTimestamp(),
      });

      alert('게시물이 등록되었습니다!');
      navigate('/community');
    } catch (err) {
      console.error('게시물 등록 실패:', err);
      alert('게시물 등록 중 오류 발생: ' + err.message);
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
