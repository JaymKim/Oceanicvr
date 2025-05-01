import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from 'firebase/storage';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function DivePointEdit() {
  const { id } = useParams();
  const { user, userData } = useContext(UserInfoContext);
  const navigate = useNavigate();
  const db = getFirestore();
  const storage = getStorage();

  const [region, setRegion] = useState('');
  const [resort, setResort] = useState('');
  const [title, setTitle] = useState('');
  const [depth, setDepth] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchPoint = async () => {
      const ref = doc(db, 'divePoints', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setRegion(data.region || '');
        setResort(data.resort || '');
        setTitle(data.title || '');
        setDepth(data.depth || '');
        setDescription(data.description || '');
        setLocation(data.location || '');
        setExistingImageUrl(data.imageUrl || '');
      } else {
        alert('포인트 정보가 존재하지 않습니다.');
        navigate('/points');
      }
    };
    fetchPoint();
  }, [db, id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!region || !resort || !title || !description) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    setUploading(true);

    try {
      let newImageUrl = existingImageUrl;

      if (imageRemoved) {
        newImageUrl = '';
      }

      if (imageFile) {
        const storageRef = ref(storage, `divePoints/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        newImageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, 'divePoints', id), {
        region,
        resort,
        title,
        depth,
        description,
        location,
        imageUrl: newImageUrl,
      });

      alert('수정이 완료되었습니다.');
      navigate('/points');
    } catch (err) {
      console.error('수정 중 오류:', err);
      alert('수정 중 오류가 발생했습니다.');
    }

    setUploading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h1 className="text-2xl font-bold mb-6">✏️ 다이브 포인트 수정</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="지역명"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="리조트명"
          value={resort}
          onChange={(e) => setResort(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="포인트명"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="수심 정보 (예: 최대 18m)"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <textarea
          placeholder="포인트 설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-4 p-2 border rounded h-40"
          required
        />
        <input
          type="text"
          placeholder="위치 또는 좌표"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        {existingImageUrl && !imageRemoved && !imageFile && (
          <div className="mb-4 relative group">
            <img
              src={existingImageUrl}
              alt="기존 이미지"
              className="w-full h-auto rounded"
            />
            <button
              type="button"
              onClick={() => setImageRemoved(true)}
              className="absolute top-1 right-1 text-white bg-red-500 hover:bg-red-600 text-xs px-2 py-1 rounded"
            >
              ❌ 삭제
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="mb-6"
        />

        <div className="mt-4">
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {uploading ? '업로드 중...' : '수정 완료'}
          </button>
        </div>
      </form>
    </div>
  );
}
