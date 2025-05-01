import React, { useEffect, useState, useContext } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { UserInfoContext } from '../../contexts/UserInfoContext';

export default function Qna() {
  const [posts, setPosts] = useState([]);
  const db = getFirestore();
  const { user } = useContext(UserInfoContext);

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, 'community', 'qna', 'posts'), orderBy('createdAt', 'desc'));
      const qSnap = await getDocs(q);
      const list = await Promise.all(
        qSnap.docs.map(async (docSnap) => {
          const data = docSnap.data();

          // 댓글 개수
          const commentsSnap = await getDocs(collection(db, 'community', 'qna', 'posts', docSnap.id, 'comments'));

          // levelIcon
          let levelIcon = '👤';
          if (data.authorUid) {
            const userRef = doc(db, 'users', data.authorUid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              levelIcon = userSnap.data().levelIcon || '👤';
            }
          }

          return {
            id: docSnap.id,
            ...data,
            commentCount: commentsSnap.size,
            levelIcon,
          };
        })
      );
      setPosts(list);
    };
    fetchPosts();
  }, [db]);

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <div className="flex justify-between mb-3">
        <h1 className="text-xl font-bold">❓ 질문과 답변</h1>
        <Link to="/community/qna/write" className="bg-sky-500 text-white px-3 py-1.5 text-sm rounded hover:bg-sky-600">
          질문하기
        </Link>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-[0.95rem] leading-[1.8rem] text-center border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-2 border w-12">번호</th>
              <th className="py-2 px-2 border text-left w-[45%]">제목</th>
              <th className="py-2 px-2 border w-24">작성자</th>
              <th className="py-2 px-2 border w-28">작성일</th>
              <th className="py-2 px-2 border w-12">추천</th>
              <th className="py-2 px-2 border w-12">조회</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, idx) => (
              <tr key={post.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-2 border">{posts.length - idx}</td>
                <td className="py-2 px-2 border text-left truncate">
                  <Link to={`/community/qna/${post.id}`} className="text-black hover:underline">
                    {post.title}
                    {post.commentCount > 0 && (
                      <span className="text-sky-600 font-semibold"> ({post.commentCount})</span>
                    )}
                    {post.solutionId && (
                      <span className="text-green-600 font-semibold ml-2">[Solution]</span>
                    )}
                  </Link>
                </td>
                <td className="py-2 px-2 border truncate">
                  {post.levelIcon || '👤'} {post.nickname || post.author}
                </td>
                <td className="py-2 px-2 border">
                  {post.createdAt?.toDate().toLocaleDateString('ko-KR')}
                </td>
                <td className="py-2 px-2 border">{post.likes || 0}</td>
                <td className="py-2 px-2 border">{post.viewCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
