import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    email: null,
    role: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = Cookies.get('isAuthenticated') === 'true';
    const email = Cookies.get('email');
    const role = Cookies.get('role');

    if (isAuthenticated && email && role) {
      setAuth({ isAuthenticated, email, role });
    }
    setLoading(false);
  }, []);

  const login = (email, role) => {
    if (!email || !role) return;
    
    const cookieOptions = { 
      secure: true,
      expires: 1, // 1 day
      sameSite: 'strict'
    };
    
    Cookies.set('isAuthenticated', 'true', cookieOptions);
    Cookies.set('email', email, cookieOptions);
    Cookies.set('role', role, cookieOptions);
    setAuth({ isAuthenticated: true, email, role });
  };

  const logout = () => {
    Cookies.remove('isAuthenticated');
    Cookies.remove('email');
    Cookies.remove('role');
    setAuth({ isAuthenticated: false, email: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 