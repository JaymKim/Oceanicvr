// src/pages/Home.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function Home() {
  const { user } = useContext(UserInfoContext);

  return (
    <div className="relative">
      {/* 상단 고래 이미지 배경 */}
      <div
        className="h-[600px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/humpback-sketch.png')" }}
      >
        <div className="mt-32 bg-white/80 p-6 rounded shadow text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-2">Oceanic VR Dive</h1>
          <p className="text-gray-700 mb-4">Explore the sea, for everyone.</p>
          
          {/* ✅ 로그인하지 않은 경우에만 로그인 버튼을 보여줌 */}
          {!user && (
            <Link
              to="/login"
              className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
            >
              로그인하러 가기
            </Link>
          )}
        </div>
      </div>

      {/* 소개 섹션 */}
      <div className="pt-20 pb-12 px-4 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">🌊 바다와 함께하는 감성적 순간</h2>
        <p className="text-gray-600 leading-relaxed">
          Oceanic VR Dive 는 바다를 원하는 그 누구라도 바다를 체험할 수 있도록 돕는 플랫폼입니다.
          가상현실, 커뮤니티, 다이빙 스킬, 그리고 감성을 담은 사진과 영상을 만나보세요.
        </p>
      </div>
    </div>
  );
}
