// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { UserInfoProvider } from './contexts/UserInfoContext';
import LanguageContext from './contexts/LanguageContext';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileEdit from './pages/ProfileEdit';

// 자유게시판 관련
import FreeBoard from './pages/community/FreeBoard';
import FreeBoardWrite from './pages/community/FreeBoardWrite';
import FreeBoardEdit from './pages/community/FreeBoardEdit';
import PostDetail from './pages/PostDetail';
import Qna from './pages/community/Qna';

// 투어 관련
import TourRequest from './pages/community/TourRequest';
import TourList from './pages/TourList';
import TourDetail from './pages/TourDetail';

// 갤러리 관련
import Gallery from './pages/Gallery';
import GalleryUpload from './pages/GalleryUpload';

// 투어 영상 갤러리
import TourVideosUpload from './pages/TourVideosUpload';
import TourGalleryList from './pages/TourGalleryList'; // ✅ 추가

// 기타 섹션 페이지
import Shopping from './pages/Shopping';
import InstructorBoard from './pages/InstructorBoard';

import './index.css';

function App() {
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <UserInfoProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white text-gray-800">
            <Navbar />
            <Routes>
              {/* 기본 홈/인증 */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />

              {/* 자유게시판 */}
              <Route path="/community/free" element={<FreeBoard />} />
              <Route path="/community/free/write" element={<FreeBoardWrite />} />
              <Route path="/community/free/edit/:id" element={<FreeBoardEdit />} />
              <Route path="/community/free/:id" element={<PostDetail />} />
              <Route path="/community/qna" element={<Qna />} />

              {/* 투어 신청 */}
              <Route path="/community/tour" element={<TourList />} />
              <Route path="/community/tour/request" element={<TourRequest />} />
              <Route path="/community/tour/:id" element={<TourDetail />} />

              {/* 갤러리 */}
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/upload" element={<GalleryUpload />} />

              {/* 투어 영상 갤러리 */}
              <Route path="/tour-videos" element={<TourGalleryList />} /> {/* ✅ 목록 */}
              <Route path="/tour-videos/upload" element={<TourVideosUpload />} /> {/* ✅ 업로드 */}

              {/* 쇼핑몰 */}
              <Route path="/shopping-mall" element={<Shopping />} />

              {/* 강사진 */}
              <Route path="/instructor" element={<InstructorBoard />} />
            </Routes>
          </div>
        </Router>
      </UserInfoProvider>
    </LanguageContext.Provider>
  );
}

export default App;
