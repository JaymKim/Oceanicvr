// /src/pages/shop/Figure.jsx

import React from 'react';

export default function Figure() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-sky-700 mb-4">🎎 피규어 주문 제작</h1>

      <p className="text-gray-700 mb-6 text-lg">
        Oceanic VR Dive에서는 고객님들의 실제 사진을 바탕으로 다이빙 장비를 착용한
        맞춤형 피규어를 제작해드립니다.
      </p>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">📦 서비스 안내</h2>
        <ul className="list-disc ml-5 space-y-2 text-gray-700 text-sm">
          <li>고객이 제공한 사진을 기반으로 3D 피규어 제작</li>
          <li>다이빙 장비(BCD, 마스크, 핀 등) 착용 상태 표현</li>
          <li>제작 기간: 약 2~3주 소요</li>
          <li>배송: 전 세계 가능 (추가 배송비 있음)</li>
          <li>가격 및 상세 옵션은 추후 업데이트 예정</li>
        </ul>
      </div>

      <p className="text-sm text-gray-400 mt-8">※ 주문 기능은 곧 오픈 예정입니다.</p>
    </div>
  );
}
