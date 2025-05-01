import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(UserInfoContext);

  // ⏳ Firebase 인증 로딩 중이면 아무것도 렌더링하지 않음
  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500 text-sm">
        ⏳ 로그인 상태 확인 중...
      </div>
    );
  }

  // ❌ 로그인 안 된 경우
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ 이메일 인증 안 된 경우
  if (!user.emailVerified) {
    return (
      <div className="text-center mt-20 text-red-500 text-lg">
        이 페이지는 <strong>이메일 인증을 완료한 사용자</strong>만 접근할 수 있습니다.
      </div>
    );
  }

  // ✅ 로그인 및 인증 완료된 경우
  return children;
}
