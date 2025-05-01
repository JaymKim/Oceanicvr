import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification
} from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // ✅ 메시지 표시 후 2초 뒤 이동
  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => {
        navigate(from);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [infoMessage, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setInfoMessage('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setError('이메일 인증이 완료되지 않았습니다. 아래 버튼을 눌러 인증 메일을 다시 받을 수 있습니다.');
        setShowResend(true);
        return;
      }

      setInfoMessage('Oceanic VR Dive에 오신 것을 환영합니다.');
    } catch (err) {
      setError('로그인 실패. 이메일 또는 비밀번호를 확인하세요.');
    }
  };

  const handleResendVerification = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        await signOut(auth);
        setInfoMessage('인증 이메일이 재전송되었습니다. 메일함을 확인해주세요.');
      }
    } catch (err) {
      setError('인증 메일 재전송 실패: ' + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>

      {infoMessage && (
        <p className="text-green-600 text-sm mb-2 text-center">{infoMessage}</p>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-sky-500 text-white py-2 rounded">
          로그인
        </button>
      </form>

      {showResend && (
        <div className="mt-4 text-center">
          <button
            onClick={handleResendVerification}
            className="text-sm text-blue-500 hover:underline"
          >
            인증 메일 다시 보내기
          </button>
        </div>
      )}
    </div>
  );
}
