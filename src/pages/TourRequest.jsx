// src/pages/community/TourRequest.jsx
import React, { useState, useContext } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { UserInfoContext } from '../../contexts/UserInfoContext'; // ✅ 추가

export default function TourRequest() {
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();
  const { user } = useContext(UserInfoContext); // ✅ 로그인 유저 정보

  const [form, setForm] = useState({
    name: '',
    level: '',
    phone: '',
    date: '',
    location: '',
    region: '국내',
    overnight: '당일',
    nights: '',
    participants: 1,
    requiredLevel: '',
    requiredLogs: '',
    requestNote: '',
  });

  const [images, setImages] = useState([]);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      alert('최대 10장의 이미지만 업로드할 수 있습니다.');
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const imageUrls = await Promise.all(
        images.map(async (img) => {
          const compressed = await imageCompression(img, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
          const storageRef = ref(storage, `tour/${Date.now()}_${img.name}`);
          await uploadBytes(storageRef, compressed);
          return await getDownloadURL(storageRef);
        })
      );

      await addDoc(collection(db, 'tourRequests'), {
        ...form,
        participants: Number(form.participants),
        requiredLogs: Number(form.requiredLogs),
        createdAt: serverTimestamp(),
        images: imageUrls,
        nickname: user.displayName || '', // ✅ 닉네임 저장
        email: user.email || '', // ✅ 이메일 저장
      });

      setSuccessMessage(true);

      setTimeout(() => {
        navigate('/community/tour');
      }, 2000);

    } catch (err) {
      console.error(err);
      alert('신청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">📋 투어 신청</h2>
      {successMessage && (
        <p className="text-green-600 text-sm mb-4">
          신청이 완료되었습니다! 감사합니다.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="이름" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />
        <select name="level" value={form.level} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">자격 등급 선택</option>
          <option value="OpenWater">Open Water</option>
          <option value="Advance">Advance</option>
          <option value="Rescue">Rescue</option>
          <option value="DiveMaster">Dive Master</option>
          <option value="Instructor">Instructor</option>
          <option value="Trainer">Trainer</option>
        </select>
        <input name="phone" placeholder="연락처 (전화번호)" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="location" placeholder="투어 장소" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" required />

        <div className="flex gap-2">
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
          <input name="nights" placeholder="숙박일 수 (예: 2박 3일)" value={form.nights} onChange={handleChange} className="w-full p-2 border rounded" />
        )}

        <input type="number" name="participants" placeholder="투어 인원 수" value={form.participants} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="requiredLevel" placeholder="필요 등급 (예: Advance)" value={form.requiredLevel} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="number" name="requiredLogs" placeholder="필요 로그 수" value={form.requiredLogs} onChange={handleChange} className="w-full p-2 border rounded" />

        <textarea name="requestNote" placeholder="요청사항을 입력하세요" value={form.requestNote} onChange={handleChange} className="w-full p-2 border rounded min-h-[100px]" />

        <div>
          <label className="block text-sm font-medium mb-1">투어 장소 사진 (최대 10장, 500KB 이하)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
        </div>

        <button type="submit" className="w-full bg-sky-500 text-white py-2 rounded hover:bg-sky-600">
          신청하기
        </button>
      </form>
    </div>
  );
}
