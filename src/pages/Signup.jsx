import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agency, setAgency] = useState('PADI');
  const [level, setLevel] = useState('OpenWater');
  const [logs, setLogs] = useState(0);
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [error, setError] = useState('');
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
        setZipcode(data.zonecode);
        setAddress(data.roadAddress);
      },
    }).open();
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!birthYear || !birthMonth || !birthDay) {
      setError('생년월일을 선택해주세요.');
      return;
    }

    const fullBirthdate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        email,
        agency,
        level,
        logs: Number(logs),
        birthdate: fullBirthdate,
        zipcode,
        address,
        detailAddress,
        createdAt: new Date().toISOString()
      });

      alert('회원가입 완료! 이메일을 확인해주세요.');
      navigate('/login');
    } catch (err) {
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
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
        </div>

        <div>
          <label className="block text-sm font-medium">비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
        </div>

        <div>
          <label className="block text-sm font-medium">다이빙 단체</label>
          <select value={agency} onChange={(e) => setAgency(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
            <option value="PADI">PADI</option>
            <option value="SSI">SSI</option>
            <option value="SDI">SDI</option>
            <option value="NAUI">NAUI</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">자격 등급</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
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
          <input type="number" value={logs} onChange={(e) => setLogs(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
        </div>

        <div>
          <label className="block text-sm font-medium">생년월일</label>
          <div className="flex gap-2">
            <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} className="w-1/3 p-2 border rounded" required>
              <option value="">년</option>
              {Array.from({ length: 70 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>

            <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className="w-1/3 p-2 border rounded" required>
              <option value="">월</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>

            <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className="w-1/3 p-2 border rounded" required>
              <option value="">일</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">우편번호</label>
          <div className="flex gap-2">
            <input type="text" value={zipcode} readOnly className="w-full p-2 border rounded-md" />
            <button type="button" onClick={openPostcodePopup} className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">검색</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">기본 주소</label>
          <input type="text" value={address} readOnly className="w-full mt-1 p-2 border rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium">상세 주소</label>
          <input type="text" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-md">
          회원가입
        </button>
      </form>
    </div>
  );
}
