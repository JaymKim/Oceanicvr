import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar() {
  const { user, userData } = useContext(UserInfoContext);
  const navigate = useNavigate();

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
        {[
          { name: 'Gallery', path: '/gallery' },
          { name: 'Community', path: '/community' },
          { name: 'Tour Videos', path: '/tours' },
          { name: 'Instructor', path: '/instructors' }
        ].map(({ name, path }) => (
          user ? (
            <Link key={name} to={path} className="hover:text-sky-500 text-gray-700">
              {name}
            </Link>
          ) : (
            <span
              key={name}
              className="text-gray-400 cursor-not-allowed"
              title="로그인 후 이용 가능합니다"
            >
              {name}
            </span>
          )
        ))}

        {user ? (
          <>
            <span className="text-gray-500 hidden sm:inline">
              {userData?.level && levelIcon[userData.level]} {user.email}
            </span>
            <button onClick={handleLogout} className="text-red-500 hover:underline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-sky-500">Login</Link>
            <Link to="/signup" className="hover:text-sky-500">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
