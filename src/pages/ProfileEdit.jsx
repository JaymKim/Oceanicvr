// src/pages/ProfileEdit.jsx
import React, { useContext, useEffect, useState } from 'react';
import { UserInfoContext } from '../contexts/UserInfoContext';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser
} from 'firebase/auth';

export default function ProfileEdit() {
  const { user } = useContext(UserInfoContext);
  const [form, setForm] = useState({ nickname: '', level: '', logs: 0, address: '', detailAddress: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(null);
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          nickname: data.nickname || '',
          level: data.level || '',
          logs: data.logs || 0,
          address: data.address || '',
          detailAddress: data.detailAddress || '',
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user, db]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'nickname') {
      setNicknameAvailable(null);
    }
  };

  const checkNickname = async () => {
    if (!form.nickname) return;
    setChecking(true);
    const q = query(collection(db, 'users'), where('nickname', '==', form.nickname));
    const snapshot = await getDocs(q);
    const taken = snapshot.docs.some((doc) => doc.id !== user.uid);
    setNicknameAvailable(!taken);
    setChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (nicknameAvailable === false) {
      setError('닉네임이 이미 사용 중입니다.');
      return;
    }
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        nickname: form.nickname,
        level: form.level,
        logs: Number(form.logs),
        address: form.address,
        detailAddress: form.detailAddress,
      });
      setMessage('회원정보가 수정되었습니다.');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage('수정에 실패했습니다.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    if (!currentPassword || !newPassword) {
      setError('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMessage('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setError('비밀번호 변경 실패: ' + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!confirmDelete || !user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      alert('계정이 삭제되었습니다.');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('계정 삭제 실패: ' + err.message);
    }
  };

  if (loading) return <div className="text-center mt-10">회원정보 로딩 중...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">회원정보 수정</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium">닉네임</label>
          <div className="flex gap-2">
            <input
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
              required
            />
            <button
              type="button"
              onClick={checkNickname}
              className="mt-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              중복 확인
            </button>
          </div>
          {checking && <p className="text-sm text-gray-500 mt-1">확인 중...</p>}
          {nicknameAvailable === true && <p className="text-sm text-green-600 mt-1">사용 가능한 닉네임입니다.</p>}
          {nicknameAvailable === false && <p className="text-sm text-red-500 mt-1">이미 사용 중인 닉네임입니다.</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">자격 등급</label>
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="">선택하세요</option>
            <option value="OpenWater">Open Water</option>
            <option value="Advance">Advance</option>
            <option value="Rescue">Rescue</option>
            <option value="DiveMaster">Dive Master</option>
            <option value="Instructor">Instructor</option>
            <option value="Trainer">Trainer</option>
            <option value="일반">일반</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">로그 수</label>
          <input
            type="number"
            name="logs"
            value={form.logs}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">기본 주소</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">상세 주소</label>
          <input
            name="detailAddress"
            value={form.detailAddress}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        <button type="submit" className="w-full bg-sky-500 text-white py-2 rounded hover:bg-sky-600">
          수정 완료
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-3">비밀번호 변경</h3>
      <form onSubmit={handlePasswordChange} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium">현재 비밀번호</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button type="submit" className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600">
          비밀번호 변경
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={handleDeleteAccount}
          className="text-sm text-red-600 underline hover:text-red-800"
        >
          ⛔ 계정 탈퇴하기
        </button>
      </div>
    </div>
  );
}