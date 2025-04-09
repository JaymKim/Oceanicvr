// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './firebase';
import { UserInfoProvider } from './contexts/UserInfoContext';
import LanguageContext from './contexts/LanguageContext';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Gallery from './pages/Gallery';
import CommunityList from './pages/CommunityList';
import CommunityWrite from './pages/CommunityWrite';
import PostDetail from './pages/PostDetail';
import InstructorBoard from './pages/InstructorBoard';
import TourList from './pages/TourList';
import TourUpload from './pages/TourUpload';
import Login from './pages/Login';
import Signup from './pages/Signup';

import './index.css';

function App() {
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <UserInfoProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white text-gray-800">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/community" element={<CommunityList />} />
              <Route path="/community/new" element={<CommunityWrite />} />
              <Route path="/community/:id" element={<PostDetail />} />
              <Route path="/instructors" element={<InstructorBoard />} />
              <Route path="/tours" element={<TourList />} />
              <Route path="/tours/upload" element={<TourUpload />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </div>
        </Router>
      </UserInfoProvider>
    </LanguageContext.Provider>
  );
}

export default App;
