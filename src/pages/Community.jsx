import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar() {
  const { user, userData } = useContext(UserInfoContext);
  const navigate = useNavigate();

  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false); // 서브 메뉴 상태

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

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-sky-600 flex items-center gap-2">
        🌊 Oceanic VR Dive
      </Link>

      <div className="flex gap-6 text-sm font-medium items-center">
        {/* Community 메뉴 */}
        <div
          key="community"
          className="relative"
          onMouseEnter={() => setIsSubMenuVisible(true)} // 마우스 올리기
          onMouseLeave={() => setIsSubMenuVisible(false)} // 마우스 떼기
        >
          <span className="hover:text-sky-500 text-gray-700 cursor-pointer">
            Community
          </span>
          {isSubMenuVisible && (
            <div
              className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-md w-48 z-50"  // z-index 추가
              style={{ zIndex: 1000 }}  // 서브 메뉴가 다른 요소들 위에 보이도록 설정
            >
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
          <Link to="/gallery" className="hover:text-sky-500 text-gray-700">
            Gallery
          </Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed" title="로그인 후 이용 가능합니다">
            Gallery
          </span>
        )}

        {/* Tour Videos */}
        {user ? (
          <Link to="/tours" className="hover:text-sky-500 text-gray-700">
            Tour Videos
          </Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed" title="로그인 후 이용 가능합니다">
            Tour Videos
          </span>
        )}

        {/* Shopping Mall */}
        {user ? (
          <Link to="/shopping" className="hover:text-sky-500 text-gray-700">
            Shopping Mall
          </Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed" title="로그인 후 이용 가능합니다">
            Shopping Mall
          </span>
        )}

        {/* Instructor */}
        {user ? (
          <Link to="/instructors" className="hover:text-sky-500 text-gray-700">
            Instructor
          </Link>
        ) : (
          <span className="text-gray-400 cursor-not-allowed" title="로그인 후 이용 가능합니다">
            Instructor
          </span>
        )}

        {/* 로그인 여부에 따른 처리 */}
        {user ? (
          <>
            <span className="text-gray-500 hidden sm:inline">
              {userData?.level && levelIcon[userData.level]} {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-sky-500">
              로그인하러 가기
            </Link>
            <Link to="/signup" className="hover:text-sky-500">
              회원가입
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
