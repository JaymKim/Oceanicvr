import React, { useState, useEffect, useContext } from 'react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function Community() {
  const { user, userData } = useContext(UserInfoContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [posts, setPosts] = useState([]);
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postData);
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('로그인 후 작성하세요');
    if (!title.trim() || !content.trim()) return alert('제목과 본문을 입력하세요');

    const imageUrls = [];

    for (const file of images) {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      });

      const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(imageRef, compressed);
      const url = await getDownloadURL(imageRef);
      imageUrls.push(url);
    }

    await addDoc(collection(db, 'posts'), {
      title,
      content,
      images: imageUrls,
      email: user.email,
      level: userData?.level || '일반',
      createdAt: new Date()
    });

    setTitle('');
    setContent('');
    setImages([]);
    setPreviewUrls([]);
  };

  const levelIcons = {
    OpenWater: '🐠', Advance: '🐬', Rescue: '🛟', DiveMaster: '🧭',
    Instructor: '🎓', Trainer: '👑', 일반: '👤',
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">📢 커뮤니티 게시판</h1>

      {user && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-10">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />

          <textarea
            placeholder="본문을 작성하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded-md"
            rows={4}
            required
          />

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block"
          />

          <div className="flex flex-wrap gap-2 mt-2">
            {previewUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="preview"
                className="w-24 h-24 object-cover rounded border"
              />
            ))}
          </div>

          <button
            type="submit"
            className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
          >
            글 작성
          </button>
        </form>
      )}

      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-4 rounded-md shadow">
            <div className="text-sm text-gray-600 mb-2">
              {levelIcons[post.level] || '👤'} {post.email}
            </div>
            <h3 className="text-lg font-bold mb-1">{post.title}</h3>
            <p className="mb-2">{post.content}</p>
            <div className="flex flex-wrap gap-2">
              {post.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="uploaded"
                  className="w-32 h-32 object-cover rounded border"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
