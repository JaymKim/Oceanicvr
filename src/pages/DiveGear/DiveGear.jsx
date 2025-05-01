import React from 'react';
import { useNavigate } from 'react-router-dom';

const gears = [
  { key: 'mask', label: '마스크', image: '/gear/mask.jpg' },
  { key: 'suit', label: '슈트', image: '/gear/suit.jpg' },
  { key: 'fin', label: '핀', image: '/gear/fin.jpg' },
  { key: 'bcd', label: 'BCD', image: '/gear/bcd.jpg' },
  { key: 'regulator', label: '호흡기', image: '/gear/regulator.jpg' },
  { key: 'computer', label: '컴퓨터', image: '/gear/computer.jpg' },
  { key: 'etc', label: '기타 장비', image: '/gear/etc.jpg' },
];

export default function DiveGear() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-10 text-center">🔧 다이빙 장비 소개</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {gears.map((gear) => (
          <div
            key={gear.key}
            onClick={() => navigate(`/DiveGear/${gear.key}`)}
            className="cursor-pointer border rounded-lg shadow-sm hover:shadow-md transition p-4 text-center bg-white"
          >
            <img
              src={gear.image}
              alt={gear.label}
              onError={(e) => (e.target.src = '/gear/default.png')}
              className="w-full h-32 object-cover rounded mb-3"
            />
            <h2 className="text-lg font-semibold">{gear.label}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
