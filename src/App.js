import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserInfoProvider } from './contexts/UserInfoContext';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home'; // ✅ 홈 화면
import CommunityList from './pages/CommunityList'; // ✅ 커뮤니티 목록
import PostDetail from './pages/PostDetail';       // ✅ 게시물 상세
import CommunityWrite from './pages/CommunityWrite'; // ✅ 글쓰기 페이지
import TourList from './pages/TourList'; // ✅ 해외투어 목록
import TourUpload from './pages/TourUpload'; // ✅ 해외투어 업로드
import './index.css';

function App() {
  return (
    <UserInfoProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white text-gray-800">
          <Navbar />

          {/* Tailwind 테스트용 박스 제거함 */}

          <Routes>
            <Route path="/" element={<Home />} />                            {/* 홈 */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* 커뮤니티 */}
            <Route path="/community" element={<CommunityList />} />
            <Route path="/community/new" element={<CommunityWrite />} />
            <Route path="/community/:id" element={<PostDetail />} />

            {/* 해외투어 */}
            <Route path="/tours" element={<TourList />} />
            <Route path="/tours/upload" element={<TourUpload />} />
          </Routes>
        </div>
      </Router>
    </UserInfoProvider>
  );
}

export default App;
