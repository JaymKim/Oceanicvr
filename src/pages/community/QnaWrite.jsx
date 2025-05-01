import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function QnaWrite() {
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();
  const { user, userData } = useContext(UserInfoContext);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      alert('이미지는 최대 10장까지 업로드할 수 있습니다.');
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('제목과 내용을 모두 입력해주세요.');

    try {
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const options = {
            maxSizeMB: 0.7,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressed = await imageCompression(image, options);
          const storageRef = ref(storage, `qna/${Date.now()}_${image.name}`);
          await uploadBytes(storageRef, compressed);
          return await getDownloadURL(storageRef);
        })
      );

      const postRef = await addDoc(collection(db, 'community', 'qna', 'posts'), {
        title,
        content,
        author: userData?.nickname || user?.email || '익명',
        authorUid: user?.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        views: 0,
        solutionId: null,
        images: imageUrls,
      });

      alert('질문이 등록되었습니다.');
      navigate(`/community/qna/${postRef.id}`);
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  const handleImageRemove = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">❓ 질문 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="질문 내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded min-h-[200px]"
          required
        />

        {/* 이미지 업로드 */}
        <div>
          <label className="block mb-1 font-semibold">이미지 업로드 (최대 10장, 700KB 이하)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative text-sm text-gray-700">
                <span>📷 {img.name}</span>
                <button
                  type="button"
                  onClick={() => handleImageRemove(idx)}
                  className="ml-2 text-xs text-red-500"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600">
          질문 등록
        </button>
      </form>
    </div>
  );
}
