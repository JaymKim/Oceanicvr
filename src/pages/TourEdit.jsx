// src/pages/TourEdit.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function TourEdit() {
  const { id } = useParams();
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();
  const { user } = useContext(UserInfoContext);

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [deletedImageUrls, setDeletedImageUrls] = useState([]);

  function createRefFromUrl(storage, url) {
    const decodedUrl = decodeURIComponent(url);
    const base = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/`;
    if (!decodedUrl.startsWith(base)) {
      throw new Error('Invalid storage URL');
    }
    const path = decodedUrl.slice(base.length).split('?')[0].replace(/%2F/g, '/');
    return ref(storage, path);
  }

  const fetchLatLngFromLocation = async (locationName) => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.status === 'OK') {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      alert(`❗ 입력한 위치 "${locationName}" 에 대한 좌표를 찾을 수 없습니다.`);
      throw new Error('주소를 찾을 수 없습니다.');
    }
  };

  useEffect(() => {
    const fetchTour = async () => {
      const refDoc = doc(db, 'tourRequests', id);
      const snap = await getDoc(refDoc);
      if (snap.exists()) {
        const data = snap.data();
        if (data.authorUid !== user?.uid) {
          alert('수정 권한이 없습니다.');
          navigate('/community/tour');
          return;
        }
        setForm(data);
        setExistingImageUrls(data.imageUrls || data.images || []);
      } else {
        alert('해당 투어를 찾을 수 없습니다.');
        navigate('/community/tour');
      }
      setLoading(false);
    };
    fetchTour();
  }, [db, id, navigate, user?.uid]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...previews]);
  };

  const handleRemoveExistingImage = (url) => {
    setDeletedImageUrls(prev => [...prev, url]);
    setExistingImageUrls(prev => prev.filter(img => img !== url));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const coords = await fetchLatLngFromLocation(form.location);

      for (const url of deletedImageUrls) {
        try {
          const imageRef = createRefFromUrl(storage, url);
          await deleteObject(imageRef);
        } catch (err) {
          console.warn(`🔥 이미지 삭제 실패: ${url}`, err.message);
        }
      }

      let uploadedUrls = [];
      if (newImages.length > 0) {
        const uploadPromises = newImages.map(async (file) => {
          const storageRefPath = ref(storage, `tourRequests/${user.uid}/${Date.now()}-${file.name}`);
          const result = await uploadBytes(storageRefPath, file);
          return await getDownloadURL(result.ref);
        });
        uploadedUrls = await Promise.all(uploadPromises);
      }

      const remainingExistingImages = existingImageUrls.filter(
        (url) => !deletedImageUrls.includes(url)
      );
      const imageUrls = [...remainingExistingImages, ...uploadedUrls];

      const refDoc = doc(db, 'tourRequests', id);
      await updateDoc(refDoc, {
        ...form,
        coordinates: coords,
        imageUrls,
        updatedAt: serverTimestamp(),
      });

      alert('수정되었습니다!');
      navigate(`/community/tour/${id}`);
    } catch (err) {
      console.error('❌ 수정 실패:', err.message);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  if (loading || !form) return <div className="text-center mt-10">로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">🛠️ 투어 신청 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="requiredLevel" value={form.requiredLevel} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="number" name="requiredLogs" value={form.requiredLogs} onChange={handleChange} className="w-full p-2 border rounded" />
        <textarea name="notes" value={form.notes || ''} onChange={handleChange} className="w-full p-2 border rounded min-h-[100px]" placeholder="요청사항" />

        {/* 기존 업로드된 사진들 */}
        <div>
          <label className="block font-semibold mb-1">기존 업로드 사진</label>
          <div className="flex flex-wrap gap-2">
            {existingImageUrls.map((url, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <img src={url} alt="업로드 사진" className="w-full h-full object-cover rounded" />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                  onClick={() => handleRemoveExistingImage(url)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 새로 업로드하는 사진들 */}
        <div>
          <label className="block font-semibold mb-1">새 사진 선택</label>
          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full" />
          <div className="flex flex-wrap gap-2 mt-2">
            {previewImages.map((preview, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <img src={preview} alt="미리보기" className="w-full h-full object-cover rounded" />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                  onClick={() => handleRemoveNewImage(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          수정 완료
        </button>
      </form>
    </div>
  );
}
