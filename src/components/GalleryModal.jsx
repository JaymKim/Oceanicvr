import React, { useState, useContext } from 'react';
import { getFirestore, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { UserInfoContext } from '../contexts/UserInfoContext';
import GalleryComment from './GalleryComment';
import { useNavigate } from 'react-router-dom';

export default function GalleryModal({ photo, onClose }) {
  const { user } = useContext(UserInfoContext);
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();

  const isAuthor = user?.email === photo.author;

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(photo.title);
  const [description, setDescription] = useState(photo.description || '');
  const [hashtags, setHashtags] = useState(photo.hashtags?.join(', ') || '');
  const [isPublic, setIsPublic] = useState(photo.isPublic ?? true);
  const [showExifIndex, setShowExifIndex] = useState(null);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);

  const handleSave = async () => {
    try {
      const hashtagArray = hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      await updateDoc(doc(db, 'gallery', photo.id), {
        title,
        description,
        hashtags: hashtagArray,
        isPublic,
      });

      alert('수정 완료!');
      setEditMode(false);
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm('정말 이 이미지를 삭제하시겠습니까?');
    if (!confirm) return;

    try {
      const imagePath = photo.imagePath || `gallery/${user.uid}/${photo.url.split('%2F').pop().split('?')[0]}`;
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);

      await deleteDoc(doc(db, 'gallery', photo.id));

      setShowDeleteMessage(true);
      setTimeout(() => {
        setShowDeleteMessage(false);
        onClose();
        navigate('/gallery');
      }, 2000);
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 rounded shadow relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-lg font-bold text-sky-700 mb-2">{title}</h2>

        {showDeleteMessage && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow text-center text-sm">
              삭제 완료!
            </div>
          </div>
        )}

        <div className="space-y-3">
          {(photo.images || [photo.url]).map((url, i) => (
            <div key={i} className="relative">
              <img
                src={url}
                alt={`image-${i}`}
                onClick={() => setShowExifIndex(showExifIndex === i ? null : i)}
                className="w-full max-h-[80vh] object-contain cursor-pointer rounded hover:opacity-90 transition"
              />
              {showExifIndex === i && (
                <div
                  className="absolute top-4 right-4 bg-black/70 text-white text-xs p-3 rounded z-10 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="mb-1 font-bold text-sm">📷 촬영 정보</p>
                  <p>촬영일자: {photo.takenAt || '정보 없음'}</p>
                  <p>촬영장비: {photo.cameraModel || '정보 없음'}</p>
                  <p>조리개: {photo.aperture || '-'}</p>
                  <p>셔터속도: {photo.shutter || '-'}</p>
                  <p>ISO: {photo.iso || '-'}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 🔧 수정/삭제 버튼 영역 */}
        {isAuthor && !editMode && (
          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => navigate(`/gallery/edit/${photo.id}`)}
              className="text-sm text-green-600 hover:underline"
            >
              ✏️ 페이지에서 수정
            </button>
            <button
              onClick={() => setEditMode(true)}
              className="text-sm text-sky-600 hover:underline"
            >
              🛠 모달에서 수정
            </button>
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:underline"
            >
              🗑 삭제
            </button>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-800">
          {editMode ? (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded p-2"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded p-2 mt-2 min-h-[100px]"
              />
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full border rounded p-2 mt-2"
                placeholder="해시태그 (예: 바다, 여행)"
              />
              <label className="flex items-center gap-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                공개 여부
              </label>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={handleSave}
                  className="bg-sky-500 text-white px-4 py-1 rounded hover:bg-sky-600"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="text-gray-500 hover:underline"
                >
                  취소
                </button>
              </div>
            </>
          ) : (
            <>
              {description && (
                <p className="text-gray-600 whitespace-pre-line mt-2">
                  {description}
                </p>
              )}
              {photo.hashtags?.length > 0 && (
                <div className="text-sm text-blue-500 mt-1">
                  {photo.hashtags.map((tag, i) => (
                    <span key={i} className="mr-2">#{tag}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                작성자: {photo.nickname || photo.author}
              </p>
            </>
          )}
        </div>

        <GalleryComment imageId={photo.id} showNickname={true} />
      </div>
    </div>
  );
}
