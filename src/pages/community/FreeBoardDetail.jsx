import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function FreeBoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  const { user, userData, loading } = useContext(UserInfoContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [replyInputs, setReplyInputs] = useState({});
  const [hasLiked, setHasLiked] = useState(false);
  const [activeReply, setActiveReply] = useState(null);

  // ✅ 게시글 불러오기
  useEffect(() => {
    if (loading || !id) return;

    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'community', 'free', 'posts', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          alert('존재하지 않는 게시글입니다.');
          return navigate('/community/free');
        }

        const data = docSnap.data();
        let levelIcon = '👤';
        let nickname = data.author;
        if (data.authorUid) {
          const userRef = doc(db, 'users', data.authorUid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            levelIcon = userSnap.data().levelIcon || '👤';
            nickname = userSnap.data().nickname || data.author;
          }
        }

        setPost({ id: docSnap.id, ...data, levelIcon, nickname });

        if (user?.uid) {
          const viewRef = doc(db, 'community', 'free', 'posts', id, 'views', user.uid);
          const viewSnap = await getDoc(viewRef);
          if (!viewSnap.exists()) {
            await setDoc(viewRef, { viewedAt: serverTimestamp() });
            await updateDoc(docRef, { views: increment(1) });
          }
        }
      } catch (err) {
        console.error('🔥 게시글 로딩 실패:', err);
      }
    };

    fetchPost();
  }, [db, id, navigate, user, loading]);

  // ✅ 댓글 불러오기
  useEffect(() => {
    if (loading || !id) return;

    const q = query(
      collection(db, 'community', 'free', 'posts', id, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const commentList = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const c = docSnap.data();
            let levelIcon = '👤';
            if (c.authorUid) {
              const userRef = doc(db, 'users', c.authorUid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) levelIcon = userSnap.data().levelIcon || '👤';
            }
            const replies = await fetchReplies(docSnap.id);
            return { id: docSnap.id, ...c, levelIcon, replies };
          })
        );
        setComments(commentList);
      } catch (err) {
        console.error('🔥 댓글 로딩 실패:', err);
      }
    });

    return () => unsubscribe();
  }, [db, id, loading]);

  const fetchReplies = async (parentId) => {
    try {
      const q = query(
        collection(db, 'community', 'free', 'posts', id, 'comments', parentId, 'replies'),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);
      return Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let levelIcon = '👤';
          if (data.authorUid) {
            const userRef = doc(db, 'users', data.authorUid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) levelIcon = userSnap.data().levelIcon || '👤';
          }
          return { id: docSnap.id, ...data, levelIcon };
        })
      );
    } catch (err) {
      console.error('🔥 대댓글 로딩 실패:', err);
      return [];
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addDoc(collection(db, 'community', 'free', 'posts', id, 'comments'), {
        content: comment,
        author: user?.email,
        nickname: userData?.nickname || '',
        authorUid: user?.uid,
        createdAt: serverTimestamp(),
      });
      setComment('');
    } catch (err) {
      console.error('🔥 댓글 작성 실패:', err);
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    const replyText = replyInputs[parentId];
    if (!replyText?.trim()) return;

    try {
      await addDoc(collection(db, 'community', 'free', 'posts', id, 'comments', parentId, 'replies'), {
        content: replyText,
        author: user?.email,
        nickname: userData?.nickname || '',
        authorUid: user?.uid,
        createdAt: serverTimestamp(),
      });
      setReplyInputs((prev) => ({ ...prev, [parentId]: '' }));
      setActiveReply(null);
    } catch (err) {
      console.error('🔥 답글 작성 실패:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제할까요?')) return;
    try {
      await deleteDoc(doc(db, 'community', 'free', 'posts', id, 'comments', commentId));
    } catch (err) {
      console.error('🔥 댓글 삭제 실패:', err);
    }
  };

  const handleLike = async () => {
    try {
      const postRef = doc(db, 'community', 'free', 'posts', id);
      const postSnap = await getDoc(postRef);
      const data = postSnap.data();
      if (data.likedBy?.includes(user.uid)) {
        alert('이미 추천하셨습니다.');
        return;
      }
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: [...(data.likedBy || []), user.uid]
      });
      setHasLiked(true);
    } catch (err) {
      console.error('🔥 추천 처리 실패:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('게시글을 삭제할까요?')) return;
    try {
      await deleteDoc(doc(db, 'community', 'free', 'posts', id));
      navigate('/community/free');
    } catch (err) {
      console.error('🔥 게시글 삭제 실패:', err);
    }
  };

  if (!post) return <div className="text-center mt-10">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <Link to="/community/free" className="text-blue-600 hover:underline text-sm">
        ← 목록으로 가기
      </Link>

      <div className="bg-gray-100 p-4 rounded mt-4">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <div className="text-sm text-gray-600">
          작성자: <span className="mr-1">{post.levelIcon}</span>{post.nickname} /
          작성일: {post.createdAt?.toDate().toLocaleString()} /
          추천: {post.likes || 0} /
          조회수: {post.views || 0}

          <div className="flex flex-wrap gap-2 mt-2">
            {user?.uid && !hasLiked && (
              <button
                onClick={handleLike}
                className="text-blue-600 hover:underline text-sm"
              >
                👍 추천하기
              </button>
            )}

            {user?.uid === post.authorUid && (
              <>
                <Link
                  to={`/community/free/edit/${id}`}
                  className="text-sm text-green-600 hover:underline"
                >
                  ✏️ 수정
                </Link>
                <button
                  onClick={handleDeletePost}
                  className="text-sm text-red-500 hover:underline ml-2"
                >
                  🗑 삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 my-6">
        {post.images?.map((url, idx) => (
          <img key={idx} src={url} alt={`img-${idx}`} className="w-full rounded" />
        ))}
      </div>

      <p className="whitespace-pre-line text-gray-800 mb-10">{post.content}</p>

      {/* ✅ 여기 추가 */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate('/community/free')}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded"
        >
          📋 목록으로 가기
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">💬 댓글 ({comments.length})</h3>
        {comments.map((c) => (
          <div key={c.id} className="border-b pb-3 mb-6 text-sm">
            <div className="flex justify-between text-gray-600 mb-1">
              <span>{c.levelIcon} {c.nickname || c.author}</span>
              <span>{c.createdAt?.toDate().toLocaleString()}</span>
            </div>
            <p className="text-gray-800">{c.content}</p>

            {user?.uid === c.authorUid && (
              <button
                onClick={() => handleDeleteComment(c.id)}
                className="text-xs text-red-500 hover:underline mt-1"
              >
                삭제
              </button>
            )}

            {user && (
              <div className="mt-2">
                {activeReply === c.id ? (
                  <form onSubmit={(e) => handleReplySubmit(e, c.id)} className="space-y-2">
                    <textarea
                      value={replyInputs[c.id] || ''}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="w-full border rounded p-2 min-h-[60px]"
                      placeholder="답글을 입력하세요"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-gray-500 text-white text-xs px-3 py-1 rounded hover:bg-gray-600"
                      >
                        답글 작성
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveReply(null)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setActiveReply(c.id)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    답글쓰기
                  </button>
                )}
              </div>
            )}

            {c.replies?.length > 0 && (
              <div className="mt-4 ml-4 space-y-3 border-l pl-4">
                {c.replies.map((r) => (
                  <div key={r.id}>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{r.levelIcon} {r.nickname || r.author}</span>
                      <span>{r.createdAt?.toDate().toLocaleString()}</span>
                    </div>
                    <p className="text-gray-800">{r.content}</p>
                    {user?.uid === r.authorUid && (
                      <button
                        onClick={() =>
                          deleteDoc(
                            doc(db, 'community', 'free', 'posts', id, 'comments', c.id, 'replies', r.id)
                          )
                        }
                        className="text-xs text-red-500 hover:underline mt-1"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {user ? (
          <form onSubmit={handleCommentSubmit} className="space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded p-2 min-h-[80px]"
              placeholder="댓글을 입력하세요"
              required
            />
            <button
              type="submit"
              className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
            >
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
