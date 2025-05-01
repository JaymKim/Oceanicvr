// ✅ 기존 import 그대로 유지
import React, { useEffect, useState, useContext } from 'react';
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
  onSnapshot,
  getDocs,
  increment,
  setDoc
} from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function QnaDetail() {
  const { id } = useParams();
  const db = getFirestore();
  const navigate = useNavigate();
  const { user, userData } = useContext(UserInfoContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReply, setActiveReply] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [hasRecommended, setHasRecommended] = useState(false); // ✅ 추천 여부 상태

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'community', 'qna', 'posts', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          alert('질문을 찾을 수 없습니다.');
          return navigate('/community/qna');
        }
        const data = docSnap.data();

        // ✅ 조회수 증가 로직 (중복 방지: 1계정당 1회)
        if (user?.uid) {
          const viewRef = doc(db, 'community', 'qna', 'posts', id, 'views', user.uid);
          const viewSnap = await getDoc(viewRef);
          if (!viewSnap.exists()) {
            await updateDoc(docRef, { viewCount: increment(1) });
            await setDoc(viewRef, { viewedAt: serverTimestamp() });
          }
        } else {
          await updateDoc(docRef, { viewCount: increment(1) });
        }

        let levelIcon = '👤';
        if (data.authorUid) {
          const userRef = doc(db, 'users', data.authorUid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) levelIcon = userSnap.data().levelIcon || '👤';
        }
        setPost({ id: docSnap.id, ...data, levelIcon });

        // ✅ 추천 여부 확인
        if (user?.uid) {
          const likeDoc = await getDoc(doc(db, 'community', 'qna', 'posts', id, 'likes', user.uid));
          setHasRecommended(likeDoc.exists());
        }

      } catch (err) {
        console.error('🔥 게시글 로딩 실패:', err);
      }
    };
    fetchPost();
  }, [db, id, navigate, user?.uid]);

  useEffect(() => {
    const q = query(collection(db, 'community', 'qna', 'posts', id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, () => {
      fetchCommentsWithReplies(); // 🔄 실시간 갱신
    });
    return () => unsubscribe();
  }, [db, id]);

  const fetchCommentsWithReplies = async () => {
    try {
      const q = query(collection(db, 'community', 'qna', 'posts', id, 'comments'), orderBy('createdAt'));
      const snapshot = await getDocs(q);

      const commentData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let levelIcon = '👤';
          if (data.uid) {
            const userRef = doc(db, 'users', data.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) levelIcon = userSnap.data().levelIcon || '👤';
          }

          const replySnap = await getDocs(
            query(
              collection(db, 'community', 'qna', 'posts', id, 'comments', docSnap.id, 'replies'),
              orderBy('createdAt')
            )
          );
          const replies = replySnap.docs.map((r) => ({ id: r.id, ...r.data() }));

          return { id: docSnap.id, ...data, levelIcon, replies };
        })
      );

      setComments(commentData);
      setLoadingComments(false);
    } catch (err) {
      console.error('🔥 댓글 로딩 실패:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addDoc(collection(db, 'community', 'qna', 'posts', id, 'comments'), {
        content: comment,
        author: userData?.nickname || '익명',
        uid: user?.uid,
        createdAt: serverTimestamp(),
        isSolution: false
      });

      if (user?.uid && user.uid !== post?.authorUid && post?.authorUid) {
        await addDoc(collection(db, 'notifications'), {
          recipientUid: post.authorUid,
          postId: id,
          boardType: 'qna',
          postTitle: post.title || 'Q&A 질문',
          commentSnippet: comment.slice(0, 30),
          timestamp: serverTimestamp(),
          isRead: false,
        });
      }

      setComment('');
      await fetchCommentsWithReplies();
    } catch (err) {
      console.error('🔥 댓글 작성 실패:', err);
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    const replyText = replyInputs[parentId];
    if (!replyText?.trim()) return;

    try {
      await addDoc(collection(db, 'community', 'qna', 'posts', id, 'comments', parentId, 'replies'), {
        content: replyText,
        author: userData?.nickname || '익명',
        uid: user?.uid,
        createdAt: serverTimestamp()
      });
      setReplyInputs((prev) => ({ ...prev, [parentId]: '' }));
      setActiveReply(null);
      await fetchCommentsWithReplies();
    } catch (err) {
      console.error('🔥 답글 작성 실패:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'community', 'qna', 'posts', id, 'comments', commentId));
    await fetchCommentsWithReplies();
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('답글을 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'community', 'qna', 'posts', id, 'comments', commentId, 'replies', replyId));
    await fetchCommentsWithReplies();
  };

  const handleMarkAsSolution = async (commentId) => {
    const postRef = doc(db, 'community', 'qna', 'posts', id);
    await updateDoc(postRef, { solutionId: commentId });
    setPost((prev) => ({ ...prev, solutionId: commentId }));
  };

  const handleRecommend = async () => {
    if (!user?.uid) return alert('로그인이 필요합니다.');

    const likeRef = doc(db, 'community', 'qna', 'posts', id, 'likes', user.uid);
    const likeSnap = await getDoc(likeRef);
    if (likeSnap.exists()) {
      alert('이미 추천하셨습니다.');
      return;
    }

    await setDoc(likeRef, { likedAt: serverTimestamp() });
    const postRef = doc(db, 'community', 'qna', 'posts', id);
    await updateDoc(postRef, { likes: increment(1) });
    setPost((prev) => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    setHasRecommended(true);
  };

  if (!post) return <div className="text-center mt-10">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white border rounded shadow-sm">
      <div className="border-b px-6 py-4 bg-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800">{post.title}</h2>
        <div className="text-sm text-gray-600 mt-1 flex gap-4 flex-wrap">
          <span>작성자: {post.levelIcon || '👤'} {post.author}</span>
          <span>작성일: {post.createdAt?.toDate().toLocaleString() || '-'}</span>
          <span>조회수: {post.viewCount || 0}</span>
          <span>추천: {post.likes || 0}</span>
        </div>
      </div>

      <div className="px-6 py-6 border-b whitespace-pre-line text-gray-800">{post.content}</div>

      {post.images?.length > 0 && (
        <div className="px-6 py-4 border-b">
          <h3 className="text-sm font-semibold mb-2">📷 첨부 이미지</h3>
          <div className="flex flex-col gap-4">
            {post.images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`첨부 이미지 ${idx + 1}`}
                className="w-full max-w-2xl object-cover rounded-md shadow"
              />
            ))}
          </div>
        </div>
      )}

      {user?.uid === post.authorUid && (
        <div className="px-6 py-4 flex justify-end border-b">
          <button
            onClick={async () => {
              if (!window.confirm('이 질문을 삭제하시겠습니까?')) return;
              await deleteDoc(doc(db, 'community', 'qna', 'posts', id));
              alert('삭제되었습니다.');
              navigate('/community/qna');
            }}
            className="text-sm text-red-600 border border-red-300 hover:bg-red-50 px-4 py-2 rounded"
          >
            🗑️ 질문 삭제
          </button>
        </div>
      )}

      <div className="px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/community/qna')}
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          📋 목록으로 가기
        </button>
        <button
          onClick={handleRecommend}
          disabled={hasRecommended}
          className={`text-sm px-4 py-2 rounded ${hasRecommended ? 'bg-gray-300 text-gray-600' : 'bg-red-500 hover:bg-red-600 text-white'}`}
        >
          👍 추천하기
        </button>
      </div>

      <div className="px-6 py-6">
        <h3 className="text-lg font-bold mb-4">💬 답변 ({comments.length})</h3>

        {loadingComments ? (
          <div className="text-center">댓글을 로딩 중...</div>
        ) : (
          <div className="space-y-4 mb-6">
            {comments.map((c) => (
              <div key={c.id} className={`border p-3 rounded ${post.solutionId === c.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <div className="text-sm text-gray-600 mb-1 flex justify-between">
                  <span>{c.levelIcon || '👤'} {c.author} · {c.createdAt?.toDate().toLocaleString()}</span>
                  {user?.uid === c.uid && (
                    <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-red-500 hover:underline">
                      삭제
                    </button>
                  )}
                </div>
                <div className="text-gray-800 mb-2">{c.content}</div>

                {c.replies?.length > 0 && (
                  <div className="mt-3 ml-4 space-y-2 border-l pl-4">
                    {c.replies.map((r) => (
                      <div key={r.id}>
                        <div className="text-xs text-gray-600 flex justify-between">
                          <span>{r.author} · {r.createdAt?.toDate().toLocaleString()}</span>
                          {user?.uid === r.uid && (
                            <button onClick={() => handleDeleteReply(c.id, r.id)} className="text-red-400 text-xs hover:underline">
                              삭제
                            </button>
                          )}
                        </div>
                        <div className="text-sm text-gray-800">{r.content}</div>
                      </div>
                    ))}
                  </div>
                )}

                {post.authorUid === user?.uid && post.solutionId !== c.id && (
                  <button
                    onClick={() => handleMarkAsSolution(c.id)}
                    className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    💡 답변채택하기
                  </button>
                )}
                {post.solutionId === c.id && (
                  <span className="text-green-700 text-xs font-bold">✔ 채택된 답변</span>
                )}

                {user && (
                  <div className="mt-2">
                    {activeReply === c.id ? (
                      <form onSubmit={(e) => handleReplySubmit(e, c.id)} className="space-y-2">
                        <textarea
                          value={replyInputs[c.id] || ''}
                          onChange={(e) => setReplyInputs((prev) => ({ ...prev, [c.id]: e.target.value }))}
                          placeholder="답글을 입력하세요"
                          className="w-full p-2 border rounded min-h-[60px] text-sm"
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="text-xs px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">
                            답글 작성
                          </button>
                          <button type="button" onClick={() => setActiveReply(null)} className="text-xs text-red-500 hover:underline">
                            취소
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button onClick={() => setActiveReply(c.id)} className="text-xs text-blue-500 hover:underline">
                        답글쓰기
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {user ? (
          <form onSubmit={handleCommentSubmit} className="space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded p-2 min-h-[80px]"
              placeholder="답변을 입력하세요"
              required
            />
            <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded">
              답변 작성
            </button>
          </form>
        ) : (
          <p className="text-gray-500 text-sm">※ 로그인 후 답변을 작성할 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
