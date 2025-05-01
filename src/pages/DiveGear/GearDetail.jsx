// src/pages/DiveGear/GearDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import GearComment from './GearComment';

const gearData = {
  mask: {
    title: '마스크',
    description:
      '마스크는 얼굴과 눈을 보호하고 물속 시야를 확보해주는 장비입니다. 단렌즈, 이중렌즈 등 종류가 있으며 김서림 방지 처리가 중요합니다.',
    image: '/gear/mask.jpg'
  },
  suit: {
    title: '슈트',
    description: '슈트는 체온을 유지하고 외부로부터 피부를 보호하는 역할을 합니다. 웻슈트, 드라이슈트 등 다양한 종류가 있습니다.',
    image: '/gear/suit.jpg'
  },
  fin: {
    title: '핀',
    description: '핀은 다리의 추진력을 도와줍니다. 오픈힐 핀과 풀풋 핀이 있으며 용도에 맞게 선택합니다.',
    image: '/gear/fin.jpg'
  },
  bcd: {
    title: 'BCD',
    description: 'BCD는 부력 조절 장비로, 수심에 따라 부력을 조절하여 중성을 유지할 수 있도록 돕습니다.',
    image: '/gear/bcd.jpg'
  },
  regulator: {
    title: '호흡기',
    description: '레귤레이터는 공기탱크의 압축 공기를 마실 수 있게 해주는 장비입니다. 1단계와 2단계로 구성됩니다.',
    image: '/gear/regulator.jpg'
  },
  computer: {
    title: '다이브 컴퓨터',
    description: '수심, 시간, 무감압 시간 등을 계산해주는 전자 장비로, 다이빙 안전을 위한 필수 장비입니다.',
    image: '/gear/computer.jpg'
  },
  etc: {
    title: '기타 장비',
    description: '부츠, 장갑, 스노클, 나침반 등 다양한 보조 장비들도 중요합니다.',
    image: '/gear/etc.jpg'
  }
};

export default function GearDetail() {
  const { gearId } = useParams();
  const gear = gearData[gearId];

  if (!gear) return <div className="text-center mt-20">장비 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">🛠 {gear.title}</h1>
      <img src={gear.image} alt={gear.title} className="w-full h-64 object-cover rounded mb-4" />
      <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line">{gear.description}</p>

      {/* ✅ 댓글 컴포넌트 연결 */}
      <GearComment gearId={gearId} />
    </div>
  );
}