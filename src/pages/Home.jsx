import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { UserInfoContext } from '../contexts/UserInfoContext';
import LoggedInUserList from '../components/LoggedInUserList';
import Footer from '../components/Footer'; // ✅ 푸터 추가

export default function Home() {
  const { user, userData, loading } = useContext(UserInfoContext);
  const [visitorCount, setVisitorCount] = useState(0);
  const db = getFirestore();

  // ✅ 방문자수 +1
  useEffect(() => {
    if (loading) return;

    const incrementVisitorCount = async () => {
      try {
        const statsRef = doc(db, 'stats', 'siteStats');
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
          await updateDoc(statsRef, { visitorCount: increment(1) });
          const updatedSnap = await getDoc(statsRef);
          setVisitorCount(updatedSnap.data().visitorCount || 0);
        } else {
          await updateDoc(statsRef, { visitorCount: 1 }); // 문서가 없으면 새로 생성
          setVisitorCount(1);
        }
      } catch (err) {
        console.error('🔥 방문자수 업데이트 실패:', err);
      }
    };

    incrementVisitorCount();
  }, [db, loading]);

  return (
    <>
      {/* ✅ 접속자 리스트는 최상단에 고정 */}
      <LoggedInUserList />

      <div className="relative">
        {/* 로그인 사용자 리스트 우측 관리자 대시보드 버튼 */}
        <div className="flex justify-end items-center p-4">
          {userData?.admin && (
            <Link
              to="/admin/dashboard"
              className="ml-4 bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 text-sm font-semibold"
            >
              관리자 대시보드
            </Link>
          )}
        </div>

        {/* 배경 이미지 Hero Section */}
        <div
          className="h-screen bg-no-repeat bg-top bg-cover bg-fixed relative"
          style={{ backgroundImage: "url('/main-hero-vr.png')" }}
        >
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white/80 px-6 py-5 rounded-xl shadow-xl text-center max-w-xl">
            <h1 className="text-4xl font-bold text-sky-700 mb-2">OCEANIC VR DIVE</h1>
            <p className="text-gray-800 text-lg mb-1">🌊 당신의 첫 번째 숨결을 바다에 맡기세요</p>
            <p className="text-gray-700 text-sm">
              누구나 안전하게, 자유롭게, 그리고 감동과 함께 바다를 만나는 새로운 길을 엽니다.
            </p>
            {!user && (
              <Link
                to="/login"
                className="mt-4 inline-block bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition"
              >
                로그인하러 가기
              </Link>
            )}
          </div>
        </div>

        {/* 소개 섹션 */}
        <div className="pt-20 pb-12 px-4 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-sky-800">✨ 누구나 바다를 누릴 권리가 있다</h2>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            OCEANIC VR DIVE는 VR 기술과 수중 세상을 결합해, 모든 이에게 경이로운 해양 탐험을 가능케 합니다.
          </p>
          <p className="text-gray-700 text-base mb-6 leading-relaxed">
            장애가 아닌 가능성을 향해. Oceanic VR Dive는 누구나 바다를 경험할 수 있도록 설계된 새로운 차원의 스쿠버 체험 플랫폼입니다.
          </p>
          <p className="text-gray-700 italic mb-6">“가상현실로 만나는 당신의 첫 바다”</p>
          <p className="text-gray-700 italic">“물속 그 너머, 당신의 세계가 열린다”</p>
          <p className="text-sm text-gray-400 mt-8">(현재 BETA 1.41 운영중입니다. 모바일 버전은 조만간 구축 예정입니다.)</p>
        </div>

        {/* ✅ 푸터 삽입 */}
        <Footer />
      </div>
    </>
  );
}
