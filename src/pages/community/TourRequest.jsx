// src/pages/community/TourRequest.jsx
import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

export default function TourRequest() {
  const db = getFirestore();
  const storage = getStorage();
  const [form, setForm] = useState({
    name: '',
    level: '',
    phone: '',
    date: '',
    location: '',
    region: '국내',
    overnight: '당일',
    nights: '',
    participants: '',
    requiredLevel: '',
    requiredLogs: '',
  });
  const [images, setImages] = useState([]);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      alert('최대 10장까지 업로드할 수 있습니다.');
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const imageUrls = await Promise.all(
        images.map(async (img) => {
          if (img.size > 500 * 1024) {
            const compressed = await imageCompression(img, {
              maxSizeMB: 0.5,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            });
            img = compressed;
          }
          const storageRef = ref(storage, `tourImages/${Date.now()}_${img.name}`);
          await uploadBytes(storageRef, img);
          return await getDownloadURL(storageRef);
        })
      );

      await addDoc(collection(db, 'tourRequests'), {
        ...form,
        nights: form.overnight === '숙박' ? form.nights : '0',
        images: imageUrls,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setForm({
        name: '', level: '', phone: '', date: '', location: '',
        region: '국내', overnight: '당일', nights: '',
        participants: '', requiredLevel: '', requiredLogs: ''
      });
      setImages([]);
    } catch (err) {
      console.error('투어 신청 오류:', err);
      alert('신청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">📋 투어 신청</h1>
      {success && <p className="text-green-600 text-sm mb-4">신청이 완료되었습니다! 감사합니다.</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="이름" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />

        <select name="level" value={form.level} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">자격 등급 선택</option>
          <option value="일반">일반</option>
          <option value="OpenWater">Open Water</option>
          <option value="Advance">Advance</option>
          <option value="Rescue">Rescue</option>
          <option value="DiveMaster">Dive Master</option>
          <option value="Instructor">Instructor</option>
          <option value="Trainer">Trainer</option>
        </select>

        <input type="tel" name="phone" placeholder="연락처 (전화번호)" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="location" placeholder="투어 장소" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" required />

        <div className="flex gap-4">
          <select name="region" value={form.region} onChange={handleChange} className="w-1/2 p-2 border rounded">
            <option value="국내">국내</option>
            <option value="해외">해외</option>
          </select>
          <select name="overnight" value={form.overnight} onChange={handleChange} className="w-1/2 p-2 border rounded">
            <option value="당일">당일</option>
            <option value="숙박">숙박</option>
          </select>
        </div>

        {form.overnight === '숙박' && (
          <input type="text" name="nights" placeholder="예: 2박 3일" value={form.nights} onChange={handleChange} className="w-full p-2 border rounded" />
        )}

        <input type="number" name="participants" placeholder="투어 인원 수" value={form.participants} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="requiredLevel" placeholder="필요 등급 (예: Advance)" value={form.requiredLevel} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="number" name="requiredLogs" placeholder="필요 로그 수" value={form.requiredLogs} onChange={handleChange} className="w-full p-2 border rounded" />

        <div>
          <label className="block mb-1 font-medium">투어 장소 사진 (최대 10장, 500KB 이하)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full" />
          <div className="mt-2 grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="text-xs text-gray-600 truncate">📷 {img.name}</div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-sky-500 text-white py-2 rounded hover:bg-sky-600">
          신청하기
        </button>
      </form>
    </div>
  );
}