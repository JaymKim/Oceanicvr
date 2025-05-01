// ✅ 기존 import 그대로 유지
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  increment,
  getDocs
} from 'firebase/firestore';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function GalleryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  const { user, userData } = useContext(UserInfoContext);

  const [photo, setPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReply, setActiveReply] = useState(null);
  const [showExif, setShowExif] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const ref = doc(db, 'gallery', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        let levelIcon = '👤';
        if (data.authorUid) {
          const userRef = doc(db, 'users', data.authorUid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            levelIcon = userSnap.data().levelIcon || '👤';
          }
        }
        setPhoto({ id: snap.id, ...data, levelIcon });
        setHasLiked(data.likedBy?.includes(user?.uid));
      } else {
        alert('존재하지 않는 게시물입니다.');
        navigate('/gallery');
      }
    };
    fetchPost();
  }, [db, id, navigate, user?.uid]);

  useEffect(() => {
    const q = query(collection(db, 'gallery', id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let levelIcon = '👤';
          if (data.authorUid) {
            const userRef = doc(db, 'users', data.authorUid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              levelIcon = userSnap.data().levelIcon || '👤';
            }
          }
          const replies = await fetchReplies(docSnap.id);
          return { id: docSnap.id, ...data, levelIcon, replies };
        })
      );
      setComments(commentData);
    });
    return () => unsubscribe();
  }, [db, id]);

  const fetchReplies = async (parentId) => {
    const q = query(collection(db, 'gallery', id, 'comments', parentId, 'replies'), orderBy('createdAt'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addDoc(collection(db, 'gallery', id, 'comments'), {
      content: comment,
      author: user?.email || '익명',
      nickname: userData?.nickname || '',
      authorUid: user?.uid || '',
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: []
    });

    if (user?.uid && user.uid !== photo?.authorUid && photo?.authorUid) {
      await addDoc(collection(db, 'notifications'), {
        recipientUid: photo.authorUid,
        postId: id,
        boardType: 'gallery',
        postTitle: photo.title || '갤러리 게시물',
        commentSnippet: comment.slice(0, 30),
        timestamp: serverTimestamp(),
        isRead: false,
      });
    }

    setComment('');
  };

  const handleCommentLike = async (commentId) => {
    if (!user?.uid) return;
    const commentRef = doc(db, 'gallery', id, 'comments', commentId);
    const commentSnap = await getDoc(commentRef);
    const data = commentSnap.data();

    if (data.likedBy?.includes(user.uid)) {
      alert('이미 추천하셨습니다.');
      return;
    }

    await updateDoc(commentRef, {
      likes: increment(1),
      likedBy: [...(data.likedBy || []), user.uid]
    });
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    const replyText = replyInputs[parentId];
    if (!replyText?.trim()) return;

    await addDoc(collection(db, 'gallery', id, 'comments', parentId, 'replies'), {
      content: replyText,
      author: user?.email || '익명',
      nickname: userData?.nickname || '',
      authorUid: user?.uid || '',
      createdAt: serverTimestamp(),
    });

    setReplyInputs((prev) => ({ ...prev, [parentId]: '' }));
    setActiveReply(null);
  };

  const handleDeleteComment = async (commentId) => {
    const ok = window.confirm('댓글을 삭제하시겠습니까?');
    if (!ok) return;
    await deleteDoc(doc(db, 'gallery', id, 'comments', commentId));
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('답글을 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'gallery', id, 'comments', commentId, 'replies', replyId));
  };

  const handleDeletePost = async () => {
    const ok = window.confirm('이 게시물을 삭제하시겠습니까?');
    if (!ok) return;
    await deleteDoc(doc(db, 'gallery', id));
    navigate('/gallery');
  };

  const handleLike = async () => {
    const postRef = doc(db, 'gallery', id);
    const postSnap = await getDoc(postRef);
    const data = postSnap.data();

    if (data.likedBy?.includes(user.uid)) {
      alert('이미 추천하셨습니다.');
      return;
    }

    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: [...(data.likedBy || []), user.uid],
    });

    setHasLiked(true);
    setPhoto(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
  };

  const toggleExif = (idx) => {
    setSelectedImageIndex(idx === selectedImageIndex ? null : idx);
    setShowExif(idx !== selectedImageIndex);
  };

  const renderExifBox = (index) => {
    if (!photo.metadata || !photo.metadata[index] || !showExif || selectedImageIndex !== index) return null;
    const data = photo.metadata[index];
    return (
      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded max-w-xs">
        <div>📷 {data.model || '카메라 정보 없음'}</div>
        <div>📅 {data.date || '촬영일 없음'}</div>
        <div>🌙 조리개: {data.aperture || '-'}</div>
        <div>⏱ 셔터속도: {data.shutterSpeed || '-'}</div>
        <div>📸 ISO: {data.iso || '-'}</div>
      </div>
    );
  };

  if (!photo) return <div className="text-center mt-10">게시물을 불러오는 중입니다...</div>;

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#f3f4f6' }}>
      <div className="max-w-4xl mx-auto bg-white border rounded shadow px-6 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/gallery" className="text-blue-600 hover:underline text-sm">
            ← 갤러리 목록으로
          </Link>

          {user?.uid === photo.authorUid && (
            <div className="flex gap-3 text-sm">
              <Link to={`/gallery/edit/${id}`} className="text-green-600 hover:underline">
                ✏️ 수정
              </Link>
              <button onClick={handleDeletePost} className="text-red-500 hover:underline">
                🗑 삭제
              </button>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">{photo.title}</h1>
        <div className="text-sm text-gray-600 mb-4 flex gap-4 flex-wrap">
          <span>작성자: {photo.levelIcon || '👤'} {photo.nickname || photo.author}</span>
          <span>작성일: {photo.createdAt?.toDate().toLocaleString()}</span>
          <span>추천: {photo.likes || 0}</span>
          {user?.uid && !hasLiked && (
            <button onClick={handleLike} className="text-blue-600 hover:underline text-sm">
              👍 추천하기
            </button>
          )}
        </div>

        <div className="space-y-8 mb-8">
          {photo.images?.map((url, idx) => (
            <div key={idx} className="relative">
              <img
                src={url}
                alt={`업로드 이미지 ${idx + 1}`}
                className="w-full max-w-3xl object-cover rounded-md cursor-pointer"
                onClick={() => toggleExif(idx)}
              />
              {renderExifBox(idx)}
            </div>
          ))}
        </div>

        {photo.description && (
          <p className="whitespace-pre-line text-gray-800 mb-10">{photo.description}</p>
        )}

        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">💬 댓글 ({comments.length})</h3>

          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 mb-6">댓글이 없습니다.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map((c) => (
                <div key={c.id} className="border-b pb-3 text-sm">
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>{c.levelIcon || '👤'} {c.nickname || c.author}</span>
                    <span>{c.createdAt?.toDate().toLocaleString()}</span>
                  </div>
                  <p className="text-gray-800">{c.content}</p>

                  <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                    <span>추천: {c.likes || 0}</span>
                    {user?.uid && !c.likedBy?.includes(user.uid) && (
                      <button onClick={() => handleCommentLike(c.id)} className="text-blue-500 hover:underline">
                        👍 댓글 추천하기
                      </button>
                    )}
                  </div>

                  {user?.uid === c.authorUid && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-xs text-red-500 hover:underline mt-1"
                    >
                      삭제
                    </button>
                  )}

                  {c.replies?.length > 0 && (
                    <div className="mt-3 ml-4 space-y-2 border-l pl-4">
                      {c.replies.map((r) => (
                        <div key={r.id}>
                          <div className="text-xs text-gray-600 flex justify-between">
                            <span>{r.nickname || r.author} · {r.createdAt?.toDate().toLocaleString()}</span>
                            {user?.uid === r.authorUid && (
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
            <form onSubmit={handleSubmit} className="space-y-2">
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
    </div>
  );
}