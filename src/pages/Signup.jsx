import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthdate: '',
    agency: 'PADI',
    level: 'OpenWater',
    zipcode: '',
    address: '',
    detailAddress: ''
  });
  const [nicknameAvailable, setNicknameAvailable] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
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

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    const isValid = regex.test(password);
    setPasswordError(
      isValid ? '' : '비밀번호는 영문 대소문자, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.'
    );
    return isValid;
  };

  useEffect(() => {
    const allValid =
      form.name.trim() &&
      form.nickname.trim() &&
      nicknameAvailable === true &&
      form.email.trim() &&
      form.password &&
      form.confirmPassword &&
      form.phone.length === 13 &&
      form.birthdate &&
      form.detailAddress.trim() &&
      agreed &&
      form.password === form.confirmPassword &&
      validatePassword(form.password);
    setCanSubmit(allValid);
  }, [form, agreed, nicknameAvailable]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      let formatted = value.replace(/[^0-9]/g, '').slice(0, 11);
      if (formatted.length >= 4 && formatted.length < 8) {
        formatted = `${formatted.slice(0, 3)}-${formatted.slice(3)}`;
      } else if (formatted.length >= 8) {
        formatted = `${formatted.slice(0, 3)}-${formatted.slice(3, 7)}-${formatted.slice(7)}`;
      }
      setForm(prev => ({ ...prev, phone: formatted }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const checkNickname = async () => {
    if (!form.nickname.trim()) return;
    const querySnapshot = await getDocs(collection(db, 'users'));
    const taken = querySnapshot.docs.some(doc => doc.data().nickname === form.nickname);
    setNicknameAvailable(!taken);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      await setDoc(doc(db, 'users', user.uid), {
        name: form.name,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        birthdate: form.birthdate,
        agency: form.agency,
        level: form.level,
        zipcode: form.zipcode,
        address: form.address,
        detailAddress: form.detailAddress,
        createdAt: serverTimestamp(),
        admin: false,
      });

      setInfoMessage('가입이 완료되었습니다. 이메일 인증을 진행해주세요!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 가입된 이메일입니다.');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>

      {infoMessage && <div className="mb-4 text-sm text-green-600 text-center">{infoMessage}</div>}
      {error && <div className="mb-4 text-sm text-red-600 text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">이름</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required />
        </div>

        <div>
          <label className="block text-sm font-medium">닉네임</label>
          <div className="flex gap-2">
            <input name="nickname" value={form.nickname} onChange={handleChange} className="w-full p-2 border rounded" required />
            <button type="button" onClick={checkNickname} className="px-3 bg-gray-200 hover:bg-gray-300 rounded">중복확인</button>
          </div>
          {nicknameAvailable === false && <p className="text-xs text-red-500">이미 사용 중인 닉네임입니다.</p>}
          {nicknameAvailable === true && <p className="text-xs text-green-500">사용 가능한 닉네임입니다.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">이메일</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required />
        </div>

        <div>
          <label className="block text-sm font-medium">비밀번호</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required />
          {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">비밀번호 확인</label>
          <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required />
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다. 다시 입력해주세요.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">우편번호</label>
          <div className="flex gap-2">
            <input name="zipcode" value={form.zipcode} onChange={handleChange} className="w-full p-2 border rounded" readOnly />
            <button type="button" onClick={openPostcodePopup} className="px-3 bg-gray-200 hover:bg-gray-300 rounded">주소검색</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">기본 주소</label>
          <input name="address" value={form.address} onChange={handleChange} className="w-full mt-1 p-2 border rounded" readOnly />
        </div>

        <div>
          <label className="block text-sm font-medium">상세 주소</label>
          <input name="detailAddress" value={form.detailAddress} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required />
        </div>

        <div>
          <label className="block text-sm font-medium">연락처</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full mt-1 p-2 border rounded" placeholder="010-0000-0000" required />
          {form.phone.length !== 13 && <p className="text-xs text-red-500">연락처를 정확히 입력해주세요.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">생년월일</label>
          <input name="birthdate" type="date" value={form.birthdate} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required />
        </div>

        <div>
          <label className="block text-sm font-medium">다이빙 단체</label>
          <select name="agency" value={form.agency} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
            <option value="PADI">PADI</option>
            <option value="SDI">SDI</option>
            <option value="SSI">SSI</option>
            <option value="NAUI">NAUI</option>
            <option value="일반">👤 일반</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">다이빙 레벨</label>
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            disabled={form.agency === '일반'}
            className={`w-full mt-1 p-2 border rounded ${form.agency === '일반' ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
          >
            <option value="OpenWater">🅞 Open Water</option>
            <option value="Advance">🅐 Advance</option>
            <option value="Rescue">🅡 Rescue</option>
            <option value="DiveMaster">🅜 Dive Master</option>
            <option value="Instructor">🅘 Instructor</option>
            <option value="Trainer">🅣 Trainer</option>
          </select>
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mr-2" />
          <label htmlFor="agree" className="text-sm">개인정보 수집 및 이용에 동의합니다.</label>
        </div>

        <button type="submit" disabled={!canSubmit} className={`w-full text-white py-2 rounded ${canSubmit ? 'bg-sky-500 hover:bg-sky-600' : 'bg-gray-300 cursor-not-allowed'}`}>
          회원가입
        </button>
      </form>
    </div>
  );
}