import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';
import { AuthProvider } from './AuthContext'; // Correct path to AuthContext.js
import PrivateRoute from './components/PrivateRoute'; // Correct path to PrivateRoute.js

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

    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  return (
    <AuthProvider>
      <div className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('http://codingstella.com/wp-content/uploads/2024/01/download-5.jpeg')"
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
        <div className="relative z-10 h-full overflow-x-hidden" style={{
          overflowY: browserZoom >= 100 ? 'auto' : 'hidden'
        }}>
          <Toaster position="top-right" duration={3000} toastOptions={{ className: "sonner-toast" }} richColors />
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/home" element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Admin />
                </PrivateRoute>
              } />
              <Route path="/reset-password" element={
                <PrivateRoute>
                  <PasswordReset />
                </PrivateRoute>
              } />
              <Route path="/complete-profile" element={
                <PrivateRoute>
                  <CompleteProfile />
                </PrivateRoute>
              } />
            </Routes>
          </Router>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
