// src/components/NotificationBell.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Bell } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { UserInfoContext } from '../contexts/UserInfoContext';

export default function NotificationBell() {
  const { user } = useContext(UserInfoContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', user.uid),
      where('isRead', '==', false),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (newNotifs.length > 0) {
        setNotifications(newNotifs);
        setHighlight(true);
        playSound();
      }
    });

    return () => unsubscribe();
  }, [user]);

  const playSound = () => {
    const audio = new Audio('/sounds/dingdong.mp3');
    audio.play();
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    setHighlight(false); // 클릭하면 반짝임 멈춤
  };

  const handleNotifClick = async (notif) => {
    const url = notif.boardType === 'free'
      ? `/community/free/detail/${notif.postId}`
      : `/gallery/detail/${notif.postId}`;
    await updateDoc(doc(db, 'notifications', notif.id), { isRead: true });
    navigate(url);
  };

  return (
    <div className="relative">
      <button onClick={handleBellClick} className="relative">
        <Bell className="w-6 h-6 text-white" />
        {highlight && <span className="animate-ping absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">알림이 없습니다.</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className="p-3 text-sm border-b hover:bg-gray-100 cursor-pointer"
              >
                <div className="font-medium text-blue-600">{notif.postTitle}</div>
                <div className="text-gray-600 truncate">{notif.commentSnippet}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
