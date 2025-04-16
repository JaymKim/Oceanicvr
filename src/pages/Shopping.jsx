import React, { useState, useEffect } from 'react';

export default function Shopping() {
  const [products, setProducts] = useState([]);

  // 상품 목록을 불러오는 함수 (예시)
  useEffect(() => {
    const fetchProducts = () => {
      // 여기서는 예시로 하드코딩된 상품 목록을 사용하지만,
      // 실제 앱에서는 Firebase나 다른 백엔드에서 데이터를 불러올 수 있습니다.
      setProducts([
        { id: 1, name: '다이빙 장비', price: 150000, description: '최고의 다이빙 장비' },
        { id: 2, name: '스쿠버 마스크', price: 50000, description: '편안한 착용감의 스쿠버 마스크' },
        { id: 3, name: '다이빙 컴퓨터', price: 350000, description: '정확한 다이빙 데이터 기록' }
      ]);
    };

    fetchProducts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold text-sky-700">🛒 쇼핑몰</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded shadow p-4">
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{product.description}</p>
            <p className="text-xl font-bold text-gray-700">{product.price.toLocaleString()} 원</p>
            <button className="bg-sky-500 text-white px-4 py-2 rounded mt-4 hover:bg-sky-600">
              장바구니에 추가
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
