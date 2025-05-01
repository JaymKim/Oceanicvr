import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import Draggable from 'react-draggable'; // ✅ 추가

export default function LoggedInUserList() {
  const db = getFirestore();
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  const fetchUsers = async () => {
    const q = query(
      collection(db, 'users'),
      where('isLoggedIn', '==', true),
      orderBy('lastLogin', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => fetchUsers(), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUserClick = async (userId) => {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setUserDetail(snap.data());
      setSelectedUser(userId);
    }
  };

  const formatDate = (timestamp) => {
    try {
      return timestamp.toDate().toLocaleString();
    } catch {
      return '-';
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target.id === 'user-profile-overlay') {
      setSelectedUser(null);
    }
  };

  return (
    <>
      <Draggable>
        <div className="fixed top-40 left-6 z-50 w-64 bg-white border border-gray-300 shadow-lg rounded-lg cursor-move">
          <div className="flex justify-between items-center px-3 py-2 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              👥 접속자 <span className="text-blue-600">{users.length}</span>명
            </h3>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {expanded ? '⏶ 접기' : '⏷ 펼치기'}
            </button>
          </div>

          {expanded && (
            <div className="max-h-64 overflow-y-auto p-3">
              {users.length === 0 ? (
                <p className="text-xs text-gray-500">현재 접속 중인 사용자가 없습니다.</p>
              ) : (
                <ul className="space-y-1 text-sm text-gray-800">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => handleUserClick(user.id)}
                      className="flex justify-between items-center gap-2 cursor-pointer hover:text-blue-600"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">●</span>
                        <span>{user.levelIcon || '👤'}</span>
                        <span>{user.nickname || user.email}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {formatDate(user.lastLogin)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </Draggable>

      {userDetail && selectedUser && (
        <div
          id="user-profile-overlay"
          onClick={handleOutsideClick}
          className="fixed inset-0 z-40 bg-black/0"
        >
          <div className="absolute left-4 bottom-80 w-72 bg-white border border-gray-300 rounded shadow-lg p-4 text-sm z-50">
            <div className="text-lg font-bold text-gray-800 mb-2">👤 {userDetail.nickname}</div>
            <div className="text-gray-700 mb-1">등급: {userDetail.levelIcon || '일반'} ({userDetail.level})</div>
            <div className="text-gray-700 mb-2">소속 기관: {userDetail.agency || '-'}</div>
            <div className="text-xs text-gray-500">마지막 접속: {formatDate(userDetail.lastLogin)}</div>
          </div>
        </div>
      )}
    </>
  );
}
