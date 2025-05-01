import React, { useState, useContext } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function TourRequest() {
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();
  const { user, userData } = useContext(UserInfoContext);

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
    notes: ''
  });
  const [images, setImages] = useState([]);
  const [coordinates, setCoordinates] = useState(null);

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
      throw new Error('주소를 찾을 수 없습니다.');
    }
  };

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

  const handleImageRemove = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const coords = await fetchLatLngFromLocation(form.location);
      setCoordinates(coords);

      const uploadedImageUrls = [];

      for (let img of images) {
        try {
          if (img.size > 500 * 1024) {
            img = await imageCompression(img, {
              maxSizeMB: 0.5,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            });
          }

          const safeName = encodeURIComponent(img.name.replace(/\s+/g, '_'));
          const storageRef = ref(storage, `tourImages/${Date.now()}_${safeName}`);
          await uploadBytes(storageRef, img);
          const downloadUrl = await getDownloadURL(storageRef);
          uploadedImageUrls.push(downloadUrl);
        } catch (uploadErr) {
          console.warn(`❌ 이미지 업로드 실패 (${img.name}):`, uploadErr);
        }
      }

      await addDoc(collection(db, 'tourRequests'), {
        ...form,
        nights: form.overnight === '숙박' ? form.nights : '0',
        images: uploadedImageUrls,
        coordinates: coords,
        author: user.email,
        authorUid: user.uid,
        nickname: userData?.nickname || user.email,
        createdAt: serverTimestamp(),
      });

      alert('투어 신청이 완료되었습니다.');
      navigate('/community/tour');
    } catch (err) {
      console.error('🔥 투어 신청 오류:', err);
      alert('신청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">📋 투어 신청</h1>
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
        <input type="text" name="location" placeholder="투어 장소 (지역명 또는 주소)" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" required />
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
        <select name="requiredLevel" value={form.requiredLevel} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="">필요 등급 선택</option>
          <option value="OpenWater">Open Water</option>
          <option value="Advance">Advance</option>
          <option value="Rescue">Rescue</option>
          <option value="DiveMaster">Dive Master</option>
          <option value="Instructor">Instructor</option>
        </select>
        <input type="number" name="requiredLogs" placeholder="필요 로그 수" value={form.requiredLogs} onChange={handleChange} className="w-full p-2 border rounded" />
        <textarea name="notes" placeholder="요청사항 입력" value={form.notes} onChange={handleChange} className="w-full p-2 border rounded h-24" />

        <div>
          <label className="block mb-1 font-medium">투어 장소 사진 (최대 10장, 500KB 이하)</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full" />
          <ul className="mt-3 space-y-2">
            {images.map((img, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm bg-white border border-gray-200 rounded px-3 py-2 shadow">
                <span className="truncate max-w-[70%]">{img.name}</span>
                <button type="button" onClick={() => handleImageRemove(idx)} className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600">
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="w-full bg-sky-500 text-white py-2 rounded hover:bg-sky-600">
          신청하기
        </button>
      </form>

      {coordinates && (
        <div className="mt-6">
          <iframe
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/embed/v1/view?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&center=${coordinates.lat},${coordinates.lng}&zoom=14`}
            title="투어 위치"
            className="rounded"
          ></iframe>
        </div>
      )}
    </div>
  );
}
