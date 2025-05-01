// /src/components/Footer.jsx

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-16 py-6 text-sm text-gray-600">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-800">© 2025 Oceanic VR Dive</p>
          <p>All rights reserved.</p>
        </div>
        <div>
          <p>운영자: JAYMSTUDIO</p>
          <p>Email: ykjm0611@gmail.com</p>
        </div>
        <div>
          <p>
            <a href="/terms" className="hover:underline">이용약관</a> |{' '}
            <a href="/privacy" className="hover:underline">개인정보처리방침</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
