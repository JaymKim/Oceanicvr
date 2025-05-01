import React, { useState, useContext } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';
import imageCompression from 'browser-image-compression';
import * as exifr from 'exifr';

export default function GalleryUpload() {
  const { user, userData } = useContext(UserInfoContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();
  const storage = getStorage();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const combined = [...imageFiles, ...files];

    const unique = combined.filter(
      (file, index, self) =>
        index === self.findIndex(f => f.name === file.name && f.size === file.size)
    );

    if (unique.length > 20) {
      alert('최대 20장까지만 업로드할 수 있습니다.');
      return;
    }

    setImageFiles(unique);
  };

  const handleRemoveImage = (index) => {
    const updated = [...imageFiles];
    updated.splice(index, 1);
    setImageFiles(updated);
  };

  const resizeImage = async (file) => {
    const options = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('이미지 리사이징 실패:', error);
      return file;
    }
  };

  const extractExif = async (file) => {
    try {
      const data = await exifr.parse(file, [
        'Make',
        'Model',
        'DateTimeOriginal',
        'FNumber',
        'ExposureTime',
        'ISO',
      ]);
      return {
        cameraModel: `${data.Make || ''} ${data.Model || ''}`.trim(),
        takenAt: data.DateTimeOriginal || '',
        aperture: data.FNumber ? `f/${data.FNumber}` : '',
        shutter: data.ExposureTime || '',
        iso: data.ISO || '',
      };
    } catch (err) {
      console.warn('EXIF 추출 실패:', err);
      return {};
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) return alert('로그인이 필요합니다.');
    if (!title || !imageFiles.length) {
      return alert('제목과 이미지를 입력해주세요.');
    }

    setUploading(true);
    try {
      const imageUrls = [];
      const imagePaths = [];
      const exifList = [];

      for (const file of imageFiles) {
        const resized = await resizeImage(file);
        const fileName = `${Date.now()}-${file.name}`;
        const storagePath = `gallery/${user.uid}/${fileName}`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, resized);
        const downloadURL = await getDownloadURL(storageRef);

        imageUrls.push(downloadURL);
        imagePaths.push(storagePath);

        const exif = await extractExif(file);
        exifList.push(exif);
      }

      const hashtagArray = hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      await addDoc(collection(db, 'gallery'), {
        title,
        description,
        url: imageUrls[0],
        images: imageUrls,
        imagePath: imagePaths[0],
        isPublic,
        hashtags: hashtagArray,
        author: user.email,
        nickname: userData?.nickname || user.email,
        authorUid: user.uid, // ✅ 작성자 UID 추가
        levelIcon: userData?.levelIcon || '👤', // ✅ 등급 이모지 추가
        createdAt: serverTimestamp(),
        metadata: exifList
      });

      alert('업로드 완료!');
      navigate('/gallery');
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('업로드 중 문제가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-sky-700">🖼️ 이미지 업로드</h2>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
        <p className="text-xs text-gray-500">최대 20장, 1.5MB 이하로 자동 압축됩니다.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {imageFiles.map((file, index) => (
            <div key={index} className="relative border rounded overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-xs px-2 py-0.5 hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full border rounded p-2"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="설명 (선택)"
          className="w-full border rounded p-2 min-h-[100px]"
        />
        <input
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="해시태그 입력 (예: 감성, 바다, 여행)"
          className="w-full border rounded p-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          공개 여부
        </label>
        <button
          type="submit"
          disabled={uploading}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded"
        >
          {uploading ? '업로드 중...' : '업로드'}
        </button>
      </form>
    </div>
  );
}
