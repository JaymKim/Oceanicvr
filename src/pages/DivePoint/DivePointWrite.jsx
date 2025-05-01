import React, { useState, useContext, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function DivePointWrite() {
  const { user, userData } = useContext(UserInfoContext);
  const [region, setRegion] = useState('');
  const [resort, setResort] = useState('');
  const [title, setTitle] = useState('');
  const [depth, setDepth] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const allowedLevels = ['🅘', 'Trainer'];
    if (!allowedLevels.includes(userData?.levelIcon)) {
      alert('이 페이지는 Instructor 또는 Trainer만 접근할 수 있습니다.');
      navigate('/points');
    }
  }, [userData, navigate]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const totalFiles = images.length + files.length;
    if (totalFiles > 10) {
      alert('이미지는 최대 10장까지 업로드할 수 있습니다.');
      return;
    }

    const compressedFiles = await Promise.all(files.map(async (file) => {
      const options = {
        maxSizeMB: 0.7,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      try {
        const compressed = await imageCompression(file, options);
        compressed.originalName = file.name; // 이름 저장
        return compressed;
      } catch (error) {
        console.error('압축 실패:', error);
        return null;
      }
    }));

    setImages(prev => [...prev, ...compressedFiles.filter(Boolean)]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!region || !resort || !title || !description) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    setUploading(true);

    try {
      const imageUrls = [];
      for (const image of images) {
        const storageRef = ref(storage, `divePoints/${Date.now()}_${image.originalName}`);
        await uploadBytes(storageRef, image);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }

      await addDoc(collection(db, 'divePoints'), {
        title,
        region,
        resort,
        depth,
        description,
        location,
        imageUrls,
        author: user.email,
        authorUid: user.uid,
        nickname: userData?.nickname || user.email,
        levelIcon: userData?.levelIcon || '👤',
        createdAt: serverTimestamp(),
        views: 0,
      });

      alert('포인트가 등록되었습니다.');
      navigate('/points');
    } catch (err) {
      console.error('포인트 등록 실패:', err);
      alert('등록 중 오류가 발생했습니다.');
    }

    setUploading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h1 className="text-2xl font-bold mb-6">🌊 다이브 포인트 등록</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="지역명 (예: 제주도, 세부 등)" value={region}
          onChange={(e) => setRegion(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <input type="text" placeholder="리조트명 (예: 오션블루 리조트)" value={resort}
          onChange={(e) => setResort(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <input type="text" placeholder="포인트명" value={title}
          onChange={(e) => setTitle(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <input type="text" placeholder="수심 정보 (예: 최대 18m-30분 다이빙)" value={depth}
          onChange={(e) => setDepth(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <textarea placeholder="포인트에 대한 상세한 설명을 기입하여 주세요." value={description}
          onChange={(e) => setDescription(e.target.value)} className="w-full mb-4 p-2 border rounded h-40" required />
        <input type="text" placeholder="위치명 또는 좌표 (예: 제주도 서귀포시 또는 33.4996,126.5312-Google Map 기반입니다.)"
          value={location} onChange={(e) => setLocation(e.target.value)} className="w-full mb-4 p-2 border rounded" />

        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="mb-2" />

        {/* 이미지 미리보기 및 삭제 */}
        {images.length > 0 && (
          <ul className="mb-4 space-y-1">
            {images.map((img, index) => (
              <li key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded border">
                <span className="truncate">{img.originalName}</span>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ❌ 삭제
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="bg-emerald-500 text-white px-4 py-2 mt-2 rounded hover:bg-emerald-600 disabled:opacity-50"
        >
          {uploading ? '업로드 중...' : '등록하기'}
        </button>
      </form>
    </div>
  );
}
