// ProfileEdit.jsx (회원정보 수정 전체 렌더링)
import React, { useContext, useEffect, useState } from 'react';
import { UserInfoContext } from '../contexts/UserInfoContext';
import {
  getFirestore, doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import {
  reauthenticateWithCredential, EmailAuthProvider, updatePassword, deleteUser
} from 'firebase/auth';

export default function ProfileEdit() {
  const { user } = useContext(UserInfoContext);
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    phone: '',
    birthdate: '',
    agency: 'PADI',
    level: '',
    logs: 0,
    zipcode: '',
    address: '',
    detailAddress: ''
  });
  const [nicknameAvailable, setNicknameAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const openPostcodePopup = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setForm(prev => ({
          ...prev,
          zipcode: data.zonecode,
          address: data.roadAddress
        }));
      },
    }).open();
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'OpenWater': return '🅞';
      case 'Advance': return '🅐';
      case 'Rescue': return '🅡';
      case 'DiveMaster': return '🅜';
      case 'Instructor': return '🅘';
      case 'Trainer': return '🅣';
      default: return '👤';
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          name: data.name || '',
          nickname: data.nickname || '',
          phone: data.phone || '',
          birthdate: data.birthdate || '',
          agency: data.agency || 'PADI',
          level: data.level || '',
          logs: data.logs || 0,
          zipcode: data.zipcode || '',
          address: data.address || '',
          detailAddress: data.detailAddress || ''
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'nickname') {
      setNicknameAvailable(null);
    }
  };

  const checkNickname = async () => {
    if (!form.nickname.trim()) return;
    setChecking(true);
    const q = query(collection(db, 'users'), where('nickname', '==', form.nickname));
    const snapshot = await getDocs(q);
    const taken = snapshot.docs.some(doc => doc.id !== user.uid);
    setNicknameAvailable(!taken);
    setChecking(false);
  };

  const validateNewPassword = (pw) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    const isValid = regex.test(pw);
    setPasswordError(isValid ? '' : '비밀번호는 영문 대소문자, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.');
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nicknameAvailable === false) {
      setError('닉네임이 이미 사용 중입니다.');
      return;
    }
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        name: form.name,
        nickname: form.nickname,
        phone: form.phone,
        birthdate: form.birthdate,
        agency: form.agency,
        level: form.level,
        levelIcon: getLevelIcon(form.level),
        logs: Number(form.logs),
        zipcode: form.zipcode,
        address: form.address,
        detailAddress: form.detailAddress
      });
      setMessage('회원정보가 수정되었습니다.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      setMessage('수정에 실패했습니다.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setError('현재 비밀번호와 새 비밀번호를 입력해주세요.');
      return;
    }
    if (!validateNewPassword(newPassword)) return;
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-center">회원정보 수정</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">이름</label>
          <input name="name" value={form.name} readOnly className="w-full mt-1 p-2 border rounded bg-gray-100 text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium">닉네임</label>
          <div className="flex gap-2">
            <input name="nickname" value={form.nickname} onChange={handleChange} className="w-full p-2 border rounded" />
            <button type="button" onClick={checkNickname} className="px-3 bg-gray-200 hover:bg-gray-300 rounded">중복확인</button>
          </div>
          {checking && <p className="text-sm text-gray-500">확인 중...</p>}
          {nicknameAvailable === true && <p className="text-sm text-green-600">사용 가능</p>}
          {nicknameAvailable === false && <p className="text-sm text-red-500">이미 사용 중</p>}
        </div>
        <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" placeholder="연락처" />
        <input name="birthdate" type="date" value={form.birthdate} onChange={handleChange} className="w-full p-2 border rounded" />
        <div className="flex gap-2">
          <input name="zipcode" value={form.zipcode} readOnly className="w-full p-2 border rounded" />
          <button type="button" onClick={openPostcodePopup} className="px-3 bg-gray-200 hover:bg-gray-300 rounded">주소 검색</button>
        </div>
        <input name="address" value={form.address} readOnly className="w-full p-2 border rounded bg-gray-100" />
        <input name="detailAddress" value={form.detailAddress} onChange={handleChange} className="w-full p-2 border rounded" placeholder="상세주소" />
        <select name="agency" value={form.agency} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="PADI">PADI</option>
          <option value="SDI">SDI</option>
          <option value="SSI">SSI</option>
          <option value="NAUI">NAUI</option>
        </select>
        <select name="level" value={form.level} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="OpenWater">🅞 Open Water</option>
          <option value="Advance">🅐 Advance</option>
          <option value="Rescue">🅡 Rescue</option>
          <option value="DiveMaster">🅜 Dive Master</option>
          <option value="Instructor">🅘 Instructor</option>
          <option value="Trainer">🅣 Trainer</option>
          <option value="일반">👤 일반</option>
        </select>
        <input type="number" name="logs" value={form.logs} onChange={handleChange} className="w-full p-2 border rounded" placeholder="로그 수" />
        <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded">수정 완료</button>
      </form>

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h3 className="text-lg font-semibold">비밀번호 변경</h3>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="현재 비밀번호" />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="새 비밀번호" />
        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <button type="submit" className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600">비밀번호 변경</button>
      </form>

      <div className="text-center mt-6">
        <button onClick={handleDeleteAccount} className="text-sm text-red-600 underline hover:text-red-800">⛔ 계정 탈퇴하기</button>
      </div>
    </div>
  );
}