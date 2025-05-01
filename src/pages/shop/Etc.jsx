import React from 'react';

export default function Etc() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-sky-700 mb-4">🧳 기타 다이빙 관련 상품</h1>

      <p className="text-gray-700 mb-6 text-lg">
        Oceanic VR Dive에서는 다이빙을 더욱 즐겁게 해줄 다양한 제품들도 준비하고 있습니다.
      </p>

      <div className="bg-white rounded shadow p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">방수 파우치</h2>
          <p className="text-gray-700 text-sm">
            휴대폰이나 열쇠 등을 물에서 안전하게 보호할 수 있는 필수품입니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">기념 배지 & 스티커</h2>
          <p className="text-gray-700 text-sm">
            다이빙 로고나 Oceanic VR Dive 로고가 들어간 한정 굿즈입니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">기타 악세서리</h2>
          <p className="text-gray-700 text-sm">
            마우스패드, 컵받침, 열쇠고리 등 다이버 감성의 다양한 소품이 준비될 예정입니다.
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-8">※ 곧 만나보실 수 있습니다.</p>
    </div>
  );
}
