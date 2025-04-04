// App.js (메인 앱 구성)
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Community from './pages/Community';
import InstructorBoard from './pages/InstructorBoard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import LanguageContext from './contexts/LanguageContext';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white text-gray-800">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/community" element={<Community user={user} />} />
            <Route path="/instructors" element={<InstructorBoard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </Router>
    </LanguageContext.Provider>
  );
}

export default App;
