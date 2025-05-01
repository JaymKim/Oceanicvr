import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useContext, useEffect, useRef } from 'react';
import UserInfoProvider, { UserInfoContext } from './contexts/UserInfoContext';
import LanguageContext from './contexts/LanguageContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import InstructorRoute from './components/InstructorRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileEdit from './pages/ProfileEdit';

// 자유게시판
import FreeBoard from './pages/community/FreeBoard';
import FreeBoardWrite from './pages/community/FreeBoardWrite';
import FreeBoardEdit from './pages/community/FreeBoardEdit';
import FreeBoardDetail from './pages/community/FreeBoardDetail';
import FreeNoticeWrite from './pages/community/FreeNoticeWrite';

// Q&A
import Qna from './pages/community/Qna';
import QnaDetail from './pages/community/QnaDetail';
import QnaWrite from './pages/community/QnaWrite';
import QnaEdit from './pages/community/QnaEdit';

// 투어 신청
import TourRequest from './pages/community/TourRequest';
import TourList from './pages/TourList';
import TourDetail from './pages/TourDetail';
import TourEdit from './pages/TourEdit';

// 갤러리
import Gallery from './pages/Gallery';
import GalleryUpload from './pages/GalleryUpload';
import GalleryDetail from './pages/GalleryDetail';
import GalleryEdit from './pages/gallery/GalleryEdit';

// 투어 영상
import TourVideosUpload from './pages/TourVideosUpload';
import TourVideos from './pages/TourVideos';
import TourVideosEdit from './pages/TourVideosEdit';

// 쇼핑몰
import Shopping from './pages/Shopping';
import DiveGears from './pages/DiveGears';
import Gear from './pages/shop/Gear';
import Figure from './pages/shop/Figure';
import Etc from './pages/shop/Etc';

// 다이브 포인트
import DivePoint from './pages/DivePoint/DivePoint';
import DivePointWrite from './pages/DivePoint/DivePointWrite';
import DivePointDetail from './pages/DivePoint/DivePointDetail';
import DivePointEdit from './pages/DivePoint/DivePointEdit';

// 다이브 기어
import DiveGear from './pages/DiveGear/DiveGear';
import GearDetail from './pages/DiveGear/GearDetail';

// Instructor 게시판
import InstructorBoard from './pages/community/instructor/InstructorBoard';
import InstructorBoardWrite from './pages/community/instructor/InstructorBoardWrite';
import InstructorBoardEdit from './pages/community/instructor/InstructorBoardEdit';
import InstructorBoardDetail from './pages/community/instructor/InstructorBoardDetail';

// 관리자
import AdminDashboard from './pages/admin/AdminDashboard';

import './index.css';

function App() {
  const [language, setLanguage] = useState('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <UserInfoProvider>
        <AppWithAuth />
      </UserInfoProvider>
    </LanguageContext.Provider>
  );
}

function AppWithAuth() {
  const { user, loading } = useContext(UserInfoContext);
  const hasWaited = useRef(false);
  const [waitDone, setWaitDone] = useState(false);

  useEffect(() => {
    if (!hasWaited.current) {
      hasWaited.current = true;
      setTimeout(() => {
        setWaitDone(true);
      }, 300);
    }
  }, []);

  if (loading || !waitDone) {
    return (
      <div className="text-center mt-40 text-gray-500 text-sm">
        ⏳ 로그인 상태 확인 중...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />

          {/* 자유게시판 */}
          <Route path="/community/free" element={<ProtectedRoute><FreeBoard /></ProtectedRoute>} />
          <Route path="/community/free/write" element={<ProtectedRoute><FreeBoardWrite /></ProtectedRoute>} />
          <Route path="/community/free/edit/:id" element={<ProtectedRoute><FreeBoardEdit /></ProtectedRoute>} />
          <Route path="/community/free/:id" element={<ProtectedRoute><FreeBoardDetail /></ProtectedRoute>} />
          <Route path="/free/notice" element={<AdminRoute><FreeNoticeWrite /></AdminRoute>} />

          {/* Q&A */}
          <Route path="/community/qna" element={<ProtectedRoute><Qna /></ProtectedRoute>} />
          <Route path="/community/qna/write" element={<ProtectedRoute><QnaWrite /></ProtectedRoute>} />
          <Route path="/community/qna/edit/:id" element={<ProtectedRoute><QnaEdit /></ProtectedRoute>} />
          <Route path="/community/qna/:id" element={<ProtectedRoute><QnaDetail /></ProtectedRoute>} />

          {/* 투어 신청 */}
          <Route path="/community/tour" element={<ProtectedRoute><TourList /></ProtectedRoute>} />
          <Route path="/community/tour/request" element={<ProtectedRoute><TourRequest /></ProtectedRoute>} />
          <Route path="/community/tour/:id" element={<ProtectedRoute><TourDetail /></ProtectedRoute>} />
          <Route path="/tour/edit/:id" element={<ProtectedRoute><TourEdit /></ProtectedRoute>} />

          {/* 갤러리 */}
          <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/gallery/upload" element={<ProtectedRoute><GalleryUpload /></ProtectedRoute>} />
          <Route path="/gallery/:id" element={<ProtectedRoute><GalleryDetail /></ProtectedRoute>} />
          <Route path="/gallery/edit/:id" element={<ProtectedRoute><GalleryEdit /></ProtectedRoute>} />

          {/* 투어 영상 */}
          <Route path="/tour-videos" element={<ProtectedRoute><TourVideos /></ProtectedRoute>} />
          <Route path="/tour-videos/upload" element={<ProtectedRoute><TourVideosUpload /></ProtectedRoute>} />
          <Route path="/tour-videos/edit/:id" element={<ProtectedRoute><TourVideosEdit /></ProtectedRoute>} />

          {/* 쇼핑몰 */}
          <Route path="/shopping-mall" element={<ProtectedRoute><Shopping /></ProtectedRoute>} />
          <Route path="/shop/gear" element={<ProtectedRoute><Gear /></ProtectedRoute>} />
          <Route path="/shop/figure" element={<ProtectedRoute><Figure /></ProtectedRoute>} />
          <Route path="/shop/etc" element={<ProtectedRoute><Etc /></ProtectedRoute>} />

          {/* 다이브 기어 */}
          <Route path="/DiveGear" element={<ProtectedRoute><DiveGear /></ProtectedRoute>} />
          <Route path="/DiveGear/:gearId" element={<ProtectedRoute><GearDetail /></ProtectedRoute>} />

          {/* 다이브 포인트 */}
          <Route path="/points" element={<ProtectedRoute><DivePoint /></ProtectedRoute>} />
          <Route path="/points/write" element={<ProtectedRoute><DivePointWrite /></ProtectedRoute>} />
          <Route path="/points/:id" element={<ProtectedRoute><DivePointDetail /></ProtectedRoute>} />
          <Route path="/points/edit/:id" element={<ProtectedRoute><DivePointEdit /></ProtectedRoute>} />

          {/* Instructor + Trainer 전용 게시판 */}
          <Route path="/instructor" element={<InstructorRoute><InstructorBoard /></InstructorRoute>} />
          <Route path="/instructor/write" element={<InstructorRoute><InstructorBoardWrite /></InstructorRoute>} />
          <Route path="/instructor/edit/:id" element={<InstructorRoute><InstructorBoardEdit /></InstructorRoute>} />
          <Route path="/instructor/:id" element={<InstructorRoute><InstructorBoardDetail /></InstructorRoute>} />

          {/* 관리자 */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
