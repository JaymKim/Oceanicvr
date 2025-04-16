import React, { useState, useEffect, useContext } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function PostDetail() {
  const { id } = useParams();
  const db = getFirestore();
  const navigate = useNavigate();
  const { user, userData } = useContext(UserInfoContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, 'community', 'free', 'posts', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });

        const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '[]');
        if (!viewedPosts.includes(id)) {
          await updateDoc(docRef, { views: (docSnap.data().views || 0) + 1 });
          localStorage.setItem('viewedPosts', JSON.stringify([...viewedPosts, id]));
        }
      } else {
        console.log('No such document!');
      }
    };
    fetchPost();
  }, [db, id]);

  useEffect(() => {
    const q = query(
      collection(db, 'community', 'free', 'posts', id, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(commentData);
      setLoadingComments(false);
    });
    return () => unsubscribe();
  }, [db, id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addDoc(collection(db, 'community', 'free', 'posts', id, 'comments'), {
      content: comment,
      author: userData?.nickname || '익명',
      createdAt: serverTimestamp(),
      parentId: replyTo || null
    });

    setComment('');
    setReplyTo(null);
  };

  const handleDeleteComment = async (commentId) => {
    const confirm = window.confirm('댓글을 삭제하시겠습니까?');
    if (!confirm) return;
    await deleteDoc(doc(db, 'community', 'free', 'posts', id, 'comments', commentId));
  };

  const handleLike = async () => {
    if (!user?.email) return;

    const docRef = doc(db, 'community', 'free', 'posts', id);
    const docSnap = await getDoc(docRef);
    const likedBy = docSnap.data().likedBy || [];

    if (likedBy.includes(user.email)) {
      alert('이미 추천하셨습니다.');
      return;
    }

    await updateDoc(docRef, {
      likes: (docSnap.data().likes || 0) + 1,
      likedBy: [...likedBy, user.email],
    });

    setPost((prev) => ({
      ...prev,
      likes: (prev.likes || 0) + 1,
      likedBy: [...likedBy, user.email],
    }));
  };

  const handleDeletePost = async () => {
    const confirm = window.confirm('정말 이 게시글을 삭제하시겠습니까?');
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, 'community', 'free', 'posts', id));
      alert('게시글이 삭제되었습니다.');
      navigate('/community/free');
    } catch (err) {
      console.error('게시글 삭제 오류:', err);
      alert('삭제 실패!');
    }
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} className={`border border-gray-200 rounded p-3 ${isReply ? 'ml-6 bg-gray-50' : ''}`}>
      <div className="text-sm text-gray-600 mb-1 flex justify-between">
        <span>{comment.author}</span>
        <span>{comment.createdAt?.toDate().toLocaleString()}</span>
      </div>
      <div className="text-gray-800 mb-2">{comment.content}</div>
      <div className="flex gap-3">
        {user && !isReply && (
          <button
            onClick={() => {
              setReplyTo(comment.id);
              setComment('');
            }}
            className="text-xs text-blue-500 hover:underline"
          >
            댓글의 댓글 달기
          </button>
        )}
        {userData?.nickname === comment.author && (
          <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-500 hover:underline">
            삭제
          </button>
        )}
      </div>
    </div>
  );

  if (!post) return <div className="text-center mt-10">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white border rounded shadow-sm">
      {/* 제목 */}
      <div className="border-b px-6 py-4 bg-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800">{post.title}</h2>
        <div className="text-sm text-gray-600 mt-1 flex gap-4 flex-wrap">
          <span>작성자: {post.author}</span>
          <span>작성일: {post.createdAt?.toDate().toLocaleString() || '-'}</span>
          <span>추천: {post.likes || 0}</span>
          <span>조회수: {post.views || 0}</span>
        </div>
        <div className="mt-2">
          {user && (
            <button onClick={handleLike} className="text-sm text-sky-600 hover:underline">
              👍 추천하기
            </button>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="px-6 py-6 border-b whitespace-pre-line text-gray-800">{post.content}</div>

      {/* 이미지 */}
      {post.images && post.images.length > 0 && (
        <div className="px-6 py-4 border-b">
          {post.images.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`첨부 이미지 ${idx + 1}`}
              className="w-full max-w-2xl object-cover rounded-md shadow mb-4"
            />
          ))}
        </div>
      )}

      {/* 수정 & 삭제 */}
      {userData?.nickname === post.author && (
        <div className="px-6 py-4 flex justify-end border-b gap-2">
          <Link
            to={`/community/free/edit/${post.id}`}
            className="text-sm text-blue-600 border border-blue-300 hover:bg-blue-50 px-4 py-2 rounded"
          >
            ✏️ 수정
          </Link>
          <button
            onClick={handleDeletePost}
            className="text-sm text-red-600 border border-red-300 hover:bg-red-50 px-4 py-2 rounded"
          >
            🗑️ 게시글 삭제
          </button>
        </div>
      )}

      {/* 댓글 */}
      <div className="px-6 py-6">
        <h3 className="text-lg font-bold mb-4">💬 댓글 ({comments.length})</h3>

        {loadingComments ? (
          <div className="text-center">댓글을 로딩 중...</div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 mb-6">아직 댓글이 없습니다.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {comments.filter((c) => !c.parentId).map((parent) => (
              <div key={parent.id}>
                {renderComment(parent, false)}
                {comments
                  .filter((reply) => reply.parentId === parent.id)
                  .map((reply) => renderComment(reply, true))}
              </div>
            ))}
          </div>
        )}

        {/* 댓글 작성 */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="space-y-2">
            {replyTo && (
              <div className="text-sm text-gray-600">
                댓글의 댓글 작성 중...{' '}
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null);
                    setComment('');
                  }}
                  className="text-red-500 hover:underline"
                >
                  취소
                </button>
              </div>
            )}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded p-2 min-h-[80px]"
              placeholder="댓글을 입력하세요"
              required
            />
            <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded">
              {replyTo ? '답글 작성' : '댓글 작성'}
            </button>
          </form>
        ) : (
          <p className="text-gray-500 text-sm">※ 로그인 후 댓글을 작성할 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
