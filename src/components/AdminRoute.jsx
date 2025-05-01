import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function AdminRoute({ children }) {
  const { user, userData, loading } = useContext(UserInfoContext);
  const location = useLocation();

  if (loading) {
    return <div className="text-center mt-20 text-gray-500 text-sm">⏳ 로그인 상태 확인 중...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userData?.admin) {
    return (
      <div className="text-center mt-20 text-red-500 text-lg">
        이 페이지는 <strong>관리자 전용</strong>입니다. 접근 권한이 없습니다.
      </div>
    );
  }

  return children;
}
