import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';

import Home from './components/home/Home';
import Navbar from './components/navbar/Navbar';
import Login from './components/login/Login';
import Admin from './components/admin/Admin';
import PasswordReset from './components/setProfile/PasswordReset';
import CompleteProfile from './components/setProfile/CompleteProfile';

function App() {
  const [browserZoom, setBrowserZoom] = React.useState(100);

  React.useEffect(() => {
    const updateZoom = () => {
      const zoom = Math.round(window.outerWidth / window.innerWidth * 100);
      setBrowserZoom(zoom);
    };

    // Initial check
    updateZoom();

    // Add event listener for resize (which includes zoom changes)
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  return (
    <div className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: "url('http://codingstella.com/wp-content/uploads/2024/01/download-5.jpeg')"
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      {/* Content */}
      <div className="relative z-10 h-full overflow-x-hidden" style={{
        overflowY: browserZoom >= 100 ? 'auto' : 'hidden'
      }}>
        <Toaster position="top-right" duration={3000} toastOptions={{ className: "sonner-toast" }}  richColors />

        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path='/complete-profile' element={<CompleteProfile />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
