import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function FreeBoardEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  const storage = getStorage();
  const { user, userData, loading } = useContext(UserInfoContext);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);

  useEffect(() => {
    if (loading || !userData) return;

    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'community', 'free', 'posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (userData?.nickname !== data.author) {
            alert('작성자만 수정할 수 있습니다.');
            navigate(-1);
            return;
          }
          setTitle(data.title);
          setContent(data.content);
          setExistingImages(data.images || []);
          setLoadingPost(false);
        } else {
          alert('게시글을 찾을 수 없습니다.');
          navigate(-1);
        }
      } catch (err) {
        console.error('🔥 게시글 로딩 오류:', err);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
        navigate(-1);
      }
    };

    fetchPost();
  }, [db, id, userData, navigate, loading]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + newImages.length + files.length > 5) {
      alert('이미지는 최대 5장까지 가능합니다.');
      return;
    }
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleDeleteNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력하세요');
      return;
    }

    try {
      const newImageUrls = await Promise.all(
        newImages.map(async (image) => {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressed = await imageCompression(image, options);
          const safeName = encodeURIComponent(image.name.replace(/\s+/g, '_'));
          const storageRef = ref(storage, `freeboard/${Date.now()}_${safeName}`);
          await uploadBytes(storageRef, compressed);
          return await getDownloadURL(storageRef);
        })
      );

      await updateDoc(doc(db, 'community', 'free', 'posts', id), {
        title,
        content,
        images: [...existingImages, ...newImageUrls],
      });

      alert('수정 완료!');
      navigate(`/community/free/${id}`);
    } catch (err) {
      console.error('🔥 게시글 수정 실패:', err);
      alert('게시글 수정 중 오류가 발생했습니다.');
    }
  };

  if (loading || loadingPost) return <div className="text-center mt-10">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">✏️ 게시글 수정</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border rounded min-h-[150px]"
          required
        />

        {existingImages.length > 0 && (
          <div>
            <p className="font-semibold mb-2">기존 이미지</p>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url, idx) => (
                <div key={idx} className="relative">
                  <img src={url} alt={`img-${idx}`} className="w-32 h-32 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(url)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block mb-2 font-semibold">새 이미지 추가 (최대 5장)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {newImages.map((img, idx) => (
              <div key={idx} className="flex items-center gap-1 text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                <span>📷 {img.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteNewImage(idx)}
                  className="text-red-600 hover:underline"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          저장하기
        </button>
      </form>
    </div>
  );
}
