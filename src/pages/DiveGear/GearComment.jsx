// src/pages/DiveGear/GearComment.jsx
import React, { useEffect, useState, useContext } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function GearComment({ gearId }) {
  const db = getFirestore();
  const { user, userData } = useContext(UserInfoContext);
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!gearId) return;
    const q = query(collection(db, 'gearComments', gearId, 'comments'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(list);
    });
    return () => unsubscribe();
  }, [db, gearId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await addDoc(collection(db, 'gearComments', gearId, 'comments'), {
        content: input,
        uid: user?.uid,
        author: userData?.nickname || user?.email || '익명',
        createdAt: serverTimestamp()
      });
      setInput('');
    } catch (err) {
      console.error('댓글 작성 오류:', err);
    }
  };

  const handleDelete = async (commentId) => {
    const confirm = window.confirm('댓글을 삭제하시겠습니까?');
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, 'gearComments', gearId, 'comments', commentId));
    } catch (err) {
      console.error('댓글 삭제 오류:', err);
    }
  };

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold mb-3">💬 댓글</h3>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="border border-gray-200 p-3 rounded">
            <div className="text-sm text-gray-600 mb-1 flex justify-between">
              <span>{c.author} · {c.createdAt?.toDate().toLocaleString()}</span>
              {user?.uid === c.uid && (
                <button onClick={() => handleDelete(c.id)} className="text-red-500 text-xs hover:underline">삭제</button>
              )}
            </div>
            <div>{c.content}</div>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="w-full p-2 border rounded min-h-[80px]"
          />
          <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded">
            댓글 작성
          </button>
        </form>
      ) : (
        <p className="text-gray-500 text-sm mt-4">※ 로그인 후 댓글을 작성할 수 있습니다.</p>
      )}
    </div>
  );
}