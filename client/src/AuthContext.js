import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    email: null,
    role: null,
    userId: null, // Add userId here
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const isAuthenticated = Cookies.get('isAuthenticated') === 'true';
    const email = Cookies.get('email');
    const role = Cookies.get('role');
    const userId = Cookies.get('userId'); // Retrieve userId from cookies

    if (isAuthenticated && email && role && userId) {
      setAuth({ isAuthenticated, email, role, userId });
    } else {
      setAuth({ isAuthenticated: false, email: null, role: null, userId: null });
    }
    setLoading(false);
  };

  const login = (email, role, userId) => {
    const cookieOptions = { 
      secure: true,
      expires: 1,
      sameSite: 'strict',
    };

    Cookies.set('isAuthenticated', 'true', cookieOptions);
    Cookies.set('email', email, cookieOptions);
    Cookies.set('role', role, cookieOptions);
    Cookies.set('userId', userId, cookieOptions); // Save userId in cookies

    setAuth({ isAuthenticated: true, email, role, userId });
  };

  const logout = () => {
    Cookies.remove('isAuthenticated');
    Cookies.remove('email');
    Cookies.remove('role');
    Cookies.remove('userId'); // Remove userId from cookies

    setAuth({ isAuthenticated: false, email: null, role: null, userId: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading, checkAuthStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
