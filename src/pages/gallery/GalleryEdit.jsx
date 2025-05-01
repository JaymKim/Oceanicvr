import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { UserInfoContext } from '../../contexts/UserInfoContext';
import imageCompression from 'browser-image-compression';

export default function GalleryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  const storage = getStorage();
  const { user } = useContext(UserInfoContext);

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'gallery', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (user?.uid !== data.authorUid) {
          alert('작성자만 수정할 수 있습니다.');
          navigate('/gallery');
          return;
        }
        setPost(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setHashtags(data.hashtags?.join(', ') || '');
        setIsPublic(data.isPublic ?? true);
        setExistingImages(data.images || []);
      } else {
        alert('게시글이 존재하지 않습니다.');
        navigate('/gallery');
      }
      setLoading(false);
    };
    fetchData();
  }, [db, id, user, navigate]);

  const handleImageDelete = (index) => {
    const confirm = window.confirm('이미지를 삭제하시겠습니까?');
    if (!confirm) return;
    const updatedImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(updatedImages);
  };

  const handleNewImageChange = (e) => {
    setNewImages([...newImages, ...Array.from(e.target.files)]);
  };

  const handleNewImageRemove = (index) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedImageUrls = [...existingImages];
      for (const file of newImages) {
        const compressed = await imageCompression(file, { maxSizeMB: 1 });
        const filename = `${user.uid}_${Date.now()}_${file.name}`;
        const imageRef = ref(storage, `gallery/${user.uid}/${filename}`);
        await uploadBytes(imageRef, compressed);
        const url = await getDownloadURL(imageRef);
        updatedImageUrls.push(url);
      }

      const hashtagArray = hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      await updateDoc(doc(db, 'gallery', id), {
        title,
        description,
        hashtags: hashtagArray,
        isPublic,
        images: updatedImageUrls,
      });

      alert('수정 완료!');
      navigate(`/gallery/${id}`); // ✅ 수정된 경로
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정에 실패했습니다.');
    }

    setLoading(false);
  };

  if (loading) return <div className="text-center mt-10">로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-sky-700">🖊 갤러리 게시글 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          required
          className="w-full border rounded p-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="설명"
          className="w-full border rounded p-2 min-h-[100px]"
        />
        <input
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="해시태그 (예: 바다, 여행)"
          className="w-full border rounded p-2"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          공개 여부
        </label>

        <div>
          <h2 className="font-semibold mb-2">📷 기존 이미지</h2>
          <div className="grid grid-cols-2 gap-4">
            {existingImages.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt={`img-${i}`} className="w-full rounded" />
                <button
                  type="button"
                  onClick={() => handleImageDelete(i)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mt-6 mb-2">➕ 새 이미지 추가</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleNewImageChange}
            className="mb-2"
          />
          <div className="grid grid-cols-2 gap-4">
            {newImages.map((file, i) => (
              <div key={i} className="relative">
                <img src={URL.createObjectURL(file)} alt={`new-${i}`} className="w-full rounded" />
                <button
                  type="button"
                  onClick={() => handleNewImageRemove(i)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
