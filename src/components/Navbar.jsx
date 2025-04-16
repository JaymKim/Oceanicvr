import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar() {
  const { user, userData } = useContext(UserInfoContext);
  const navigate = useNavigate();

  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const levelIcon = {
    OpenWater: '🐠',
    Advance: '🐬',
    Rescue: '🛟',
    DiveMaster: '🧭',
    Instructor: '🎓',
    Trainer: '👑',
    일반: '👤',
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setIsSubMenuVisible(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => setIsSubMenuVisible(false), 200);
    setTimeoutId(id);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY });
  };

  const handleClickOutside = () => {
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0 });
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  });

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center relative">
      <Link to="/" className="text-2xl font-bold text-sky-600 flex items-center gap-2">
        <img src="/images/logo.png" alt="Oceanic VR Dive Logo" className="h-12" />
        <span className="text-3xl font-extrabold text-sky-600">OCEANIC VR DIVE</span>
      </Link>

      <div className="flex gap-6 text-sm font-medium items-center">
        {/* Community */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span className="hover:text-sky-500 text-gray-700 cursor-pointer">Community</span>
          {isSubMenuVisible && (
            <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-md w-48 z-50">
              <Link to="/community/free" className="block px-4 py-2 text-gray-700 hover:bg-sky-100">
                자유게시판
              </Link>
              <Link to="/community/tour" className="block px-4 py-2 text-gray-700 hover:bg-sky-100">
                투어신청
              </Link>
              <Link to="/community/qna" className="block px-4 py-2 text-gray-700 hover:bg-sky-100">
                Q & A
              </Link>
            </div>
          )}
        </div>

        {/* Gallery */}
        {user ? (
          <Link to="/gallery" className="hover:text-sky-500 text-gray-700">Gallery</Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed" title="로그인 후 이용 가능합니다">Gallery</span>
        )}

        {/* Tour Videos */}
        {user ? (
          <Link to="/tour-videos" className="hover:text-sky-500 text-gray-700">Tour Videos</Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed" title="로그인 후 이용 가능합니다">Tour Videos</span>
        )}

        {/* Dive Gears */}
        {user ? (
          <Link to="/gears" className="hover:text-sky-500 text-gray-700">Dive Gears</Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed" title="로그인 후 이용 가능합니다">Dive Gears</span>
        )}

        {/* Shopping Mall */}
        {user ? (
          <Link to="/shopping-mall" className="hover:text-sky-500 text-gray-700">Shopping Mall</Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed" title="로그인 후 이용 가능합니다">Shopping Mall</span>
        )}

        {/* Dive Point */}
        {user ? (
          <Link to="/points" className="hover:text-sky-500 text-gray-700">Dive Point</Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed" title="로그인 후 이용 가능합니다">Dive Point</span>
        )}

        {/* Instructor */}
        {user ? (
          <Link to="/instructor" className="hover:text-sky-500 text-gray-700">Instructor</Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed" title="로그인 후 이용 가능합니다">Instructor</span>
        )}

        {/* Auth */}
        {user ? (
          <>
            <span
              onContextMenu={handleContextMenu}
              className="text-gray-500 hidden sm:inline hover:underline cursor-pointer"
              title="우클릭으로 메뉴 열기"
            >
              {userData?.level && levelIcon[userData.level]} {userData?.nickname || user.email}
            </span>
            <button onClick={handleLogout} className="text-red-500 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-sky-500">로그인하러 가기</Link>
            <Link to="/signup" className="hover:text-sky-500">회원가입</Link>
          </>
        )}
      </div>

      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div
          className="absolute bg-white border rounded shadow-md text-sm z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => navigate('/profile/edit')}
            className="block px-4 py-2 text-left w-full hover:bg-sky-100"
          >
            👤 회원정보 수정
          </button>
        </div>
      )}
    </nav>
  );
}
