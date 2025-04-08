import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchPost = async () => {
      const docSnap = await getDoc(doc(db, 'posts', id));
      if (docSnap.exists()) {
        setPost(docSnap.data());
      }
    };
    fetchPost();
  }, [id]);

  if (!post) return <div className="text-center mt-10">로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
      <p className="mb-2 text-sm text-gray-600">작성자: {post.author}</p>
      <p className="mb-6">{post.content}</p>

      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {post.images.map((url, index) => (
            <img key={index} src={url} alt={`img-${index}`} className="rounded" />
          ))}
        </div>
      )}
    </div>
  );
}
