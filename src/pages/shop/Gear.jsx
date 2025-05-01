import React from 'react';

export default function Gear() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-sky-700 mb-4">⚙️ 다이빙 장비 소개</h1>

      <p className="text-gray-700 mb-6 text-lg">
        다이빙을 안전하고 편안하게 즐기기 위한 다양한 장비들을 소개합니다.
      </p>

      <div className="bg-white rounded shadow p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">BCD (부력 조절기)</h2>
          <p className="text-gray-700 text-sm">
            수중에서 부력을 조절하고 공기통을 고정하는 핵심 장비입니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">레귤레이터</h2>
          <p className="text-gray-700 text-sm">
            공기통에서 나오는 고압의 공기를 적절한 압력으로 조절하여 마스크를 통해 호흡하게 합니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">마스크 & 핀</h2>
          <p className="text-gray-700 text-sm">
            물속에서 선명하게 보고 효율적으로 이동하기 위한 장비입니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">다이빙 슈트</h2>
          <p className="text-gray-700 text-sm">
            체온 유지와 피부 보호를 위해 사용되는 슈트로, 수온에 따라 드라이 슈트와 웻 슈트로 나뉩니다.
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-8">※ 제품 판매 기능은 추후 추가될 예정입니다.</p>
    </div>
  );
}
