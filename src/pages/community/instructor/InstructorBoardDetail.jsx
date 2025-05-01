// src/pages/community/instructor/InstructorBoardDetail.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment,
  setDoc
} from 'firebase/firestore';
import { UserInfoContext } from '../../../contexts/UserInfoContext';

export default function InstructorBoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  const { user, userData } = useContext(UserInfoContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, 'community', 'instructor', 'posts', id);

      if (user?.uid) {
        const viewRef = doc(db, 'community', 'instructor', 'posts', id, 'views', user.uid);
        const viewSnap = await getDoc(viewRef);
        if (!viewSnap.exists()) {
          await updateDoc(docRef, {
            views: increment(1),
          });
          await setDoc(viewRef, {
            viewedAt: serverTimestamp(),
          });
        }
      }

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPost({ id: docSnap.id, ...data });
        if (data.likedBy?.includes(user?.uid)) {
          setHasLiked(true);
        }
      } else {
        alert('존재하지 않는 게시글입니다.');
        navigate('/instructor');
      }
    };
    fetchPost();
  }, [db, id, navigate, user]);

  useEffect(() => {
    const q = query(
      collection(db, 'community', 'instructor', 'posts', id, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [db, id]);

  const handleDelete = async () => {
    const ok = window.confirm('게시글을 삭제하시겠습니까?');
    if (!ok) return;
    await deleteDoc(doc(db, 'community', 'instructor', 'posts', id));
    alert('삭제되었습니다.');
    navigate('/instructor');
  };

  const handleLike = async () => {
    if (!user || !post || hasLiked) return;
    const postRef = doc(db, 'community', 'instructor', 'posts', id);
    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: [...(post.likedBy || []), user.uid],
    });
    setPost(prev => ({ ...prev, likes: (prev.likes || 0) + 1, likedBy: [...(prev.likedBy || []), user.uid] }));
    setHasLiked(true);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addDoc(collection(db, 'community', 'instructor', 'posts', id, 'comments'), {
      content: comment,
      parentId: replyingTo || null,
      author: user?.email,
      nickname: userData?.nickname || '',
      levelIcon: userData?.levelIcon || '👤',
      authorUid: user?.uid,
      createdAt: serverTimestamp(),
    });

    setComment('');
    setReplyingTo(null);
  };

  const handleCommentDelete = async (commentId) => {
    const ok = window.confirm('댓글을 삭제하시겠습니까?');
    if (!ok) return;
    await deleteDoc(doc(db, 'community', 'instructor', 'posts', id, 'comments', commentId));
  };

  const renderComments = (parentId = null, level = 0) => {
    return comments
      .filter(c => (parentId === null ? c.parentId === null || c.parentId === undefined : c.parentId === parentId))
      .map(c => (
        <div key={c.id} style={{ marginLeft: level * 20 }} className="border-b pb-3 text-sm">
          <div className="flex justify-between text-gray-600 mb-1">
            <span><span className="mr-1">{c.levelIcon || '👤'}</span>{c.nickname || c.author}</span>
            <span>{c.createdAt?.toDate().toLocaleString()}</span>
          </div>
          <p className="text-gray-800 whitespace-pre-line">{c.content}</p>
          {user?.uid === c.authorUid && (
            <button
              onClick={() => handleCommentDelete(c.id)}
              className="text-xs text-red-500 hover:underline mt-1"
            >
              삭제
            </button>
          )}
          <button
            onClick={() => setReplyingTo(c.id)}
            className="text-xs text-blue-500 hover:underline ml-2"
          >
            답글 달기
          </button>
          {replyingTo === c.id && (
            <form onSubmit={handleCommentSubmit} className="mt-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded p-2 min-h-[60px]"
                placeholder="답글을 입력하세요"
                required
              />
              <button type="submit" className="mt-1 bg-sky-600 text-white px-3 py-1 rounded text-sm hover:bg-sky-700">
                답글 작성
              </button>
            </form>
          )}
          {renderComments(c.id, level + 1)}
        </div>
      ));
  };

  if (!post) return <div className="text-center mt-10">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <Link to="/instructor" className="text-blue-600 hover:underline text-sm">
        ← Instructor 게시판 목록으로
      </Link>

      <h1 className="text-2xl font-bold mt-4">{post.title}</h1>
      <div className="text-sm text-gray-600 flex gap-4 mt-2 mb-4">
        <span>{post.levelIcon || '👤'} {post.nickname || post.author}</span>
        <span>{post.createdAt?.toDate().toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span>조회수: {post.views || 0}</span>
        <span>추천: {post.likes || 0}</span>
        <button
          disabled={hasLiked}
          onClick={handleLike}
          className={`px-3 py-1 rounded text-white text-sm ${hasLiked ? 'bg-gray-400' : 'bg-pink-500 hover:bg-pink-600'}`}
        >
          👍 추천하기
        </button>
      </div>

      <div className="space-y-4 my-6">
        {post.images?.map((url, idx) => (
          <img key={idx} src={url} alt={`img-${idx}`} className="w-full rounded" />
        ))}
      </div>

      <p className="whitespace-pre-line text-gray-800 mb-10">{post.content}</p>

      {user?.uid === post.authorUid && (
        <div className="flex gap-3 mb-10">
          <Link
            to={`/instructor/edit/${post.id}`}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            삭제
          </button>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">💬 댓글 ({comments.length})</h3>
        {renderComments()}

        {user ? (
          <form onSubmit={handleCommentSubmit} className="space-y-2 mt-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded p-2 min-h-[80px]"
              placeholder="댓글을 입력하세요"
              required
            />
            <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700">
              댓글 작성
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500">※ 로그인 후 댓글을 작성할 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
