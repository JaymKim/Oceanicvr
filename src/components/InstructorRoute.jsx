// /src/components/InstructorRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function InstructorRoute({ children }) {
  const { user, userData, loading } = useContext(UserInfoContext);

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500">
        ⏳ 로그인 상태 확인 중...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userData?.level !== 'Instructor' && userData?.level !== 'Trainer') {
    return (
      <div className="text-center mt-20 text-red-500 text-lg">
        이 페이지는 <strong>Instructor 또는 Trainer 등급</strong>만 접근할 수 있습니다.
      </div>
    );
  }

  return children;
}
