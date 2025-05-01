// src/components/GalleryComment.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function GalleryComment({ imageId, postAuthorUid, postTitle }) {
  const { user } = useContext(UserInfoContext);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const db = getFirestore();

  useEffect(() => {
    const q = query(
      collection(db, 'gallery', imageId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let nickname = data.author;

          try {
            const userDoc = await getDoc(doc(db, 'users', data.author));
            if (userDoc.exists()) {
              nickname = userDoc.data().nickname || data.author;
            }
          } catch (err) {
            console.error('닉네임 조회 실패:', err);
          }

          return { id: docSnap.id, ...data, nickname };
        })
      );
      setComments(commentList);
    });
    return () => unsubscribe();
  }, [db, imageId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addDoc(collection(db, 'gallery', imageId, 'comments'), {
      content,
      author: user?.email || '익명',
      authorUid: user?.uid || '',
      createdAt: serverTimestamp(),
    });

    // 알림 생성
    if (user?.uid && user.uid !== postAuthorUid) {
      await addDoc(collection(db, 'notifications'), {
        recipientUid: postAuthorUid,
        postId: imageId,
        boardType: 'gallery',
        postTitle: postTitle || '갤러리 게시물',
        commentSnippet: content.slice(0, 30),
        timestamp: serverTimestamp(),
        isRead: false,
      });
    }

    setContent('');
  };

  const handleDelete = async (commentId) => {
    const confirm = window.confirm('이 댓글을 삭제하시겠습니까?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'gallery', imageId, 'comments', commentId));
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-md font-semibold mb-2">💬 댓글</h3>

      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm">댓글이 없습니다.</p>
      ) : (
        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b pb-1 text-sm text-gray-800 relative group"
            >
              <p>{comment.content}</p>
              <div className="text-xs text-gray-500 flex justify-between mt-1">
                <span>{comment.nickname}</span>
                <span>{comment.createdAt?.toDate().toLocaleString()}</span>
              </div>
              {user?.email === comment.author && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="absolute top-0 right-0 text-xs text-red-500 hover:underline hidden group-hover:inline"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="w-full border rounded p-2 min-h-[60px]"
            required
          />
          <button
            type="submit"
            className="self-end bg-sky-500 hover:bg-sky-600 text-white px-4 py-1 rounded text-sm"
          >
            작성
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-400 mt-2">※ 로그인 후 댓글을 작성할 수 있습니다.</p>
      )}
    </div>
  );
}
