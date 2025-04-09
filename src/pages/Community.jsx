<<<<<<< HEAD
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
=======
import React, { useState } from 'react';

function Community({ user }) {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Welcome to Oceanic VR Community!', content: 'Feel free to share your diving stories here.', author: '🌊 Admin' },
    { id: 2, title: 'Best dive spots in Asia?', content: "Let's discuss your favorite places to dive!", author: '🐬 GuestUser' },
  ]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handlePost = (e) => {
    e.preventDefault();
    if (!title || !content) return;
    const newPost = {
      id: posts.length + 1,
      title,
      content,
      author: user?.displayName || 'Anonymous'
    };
    setPosts([newPost, ...posts]);
    setTitle('');
    setContent('');
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold text-center text-sky-600 mb-8">Community</h2>

      {user && (
        <form onSubmit={handlePost} className="bg-white p-6 rounded-lg shadow mb-10 space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
          ></textarea>
          <button
            type="submit"
            className="bg-sky-500 text-white px-6 py-2 rounded hover:bg-sky-600"
          >
            Post
>>>>>>> ce9ef6e7de67e41e2104aaeea3cdada05602fff4
          </button>
        </form>
      )}

      <div className="space-y-6">
        {posts.map(post => (
<<<<<<< HEAD
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
=======
          <div key={post.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-sky-700 mb-2">{post.title}</h3>
            <p className="text-gray-700 mb-2">{post.content}</p>
            <p className="text-sm text-gray-500">Posted by: <span className="font-medium">{post.author}</span></p>
>>>>>>> ce9ef6e7de67e41e2104aaeea3cdada05602fff4
          </div>
        ))}
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

export default Community;
>>>>>>> ce9ef6e7de67e41e2104aaeea3cdada05602fff4
