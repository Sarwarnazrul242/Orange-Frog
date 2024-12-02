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
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const isAuthenticated = Cookies.get('isAuthenticated') === 'true';
    const email = Cookies.get('email');
    const role = Cookies.get('role');

    if (isAuthenticated && email && role) {
      setAuth({ isAuthenticated, email, role });
    } else {
      setAuth({ isAuthenticated: false, email: null, role: null });
    }
    setLoading(false);
  };

  const login = (email, role) => {
    const cookieOptions = { 
      secure: true,
      expires: 1,
      sameSite: 'strict'
    };
    
    Cookies.set('isAuthenticated', 'true', cookieOptions);
    Cookies.set('email', email, cookieOptions);
    Cookies.set('role', role, cookieOptions);
    setAuth({ isAuthenticated: true, email, role });
  };

  const logout = () => {
    // Clear all cookies
    Cookies.remove('isAuthenticated');
    Cookies.remove('email');
    Cookies.remove('role');
    
    // Reset auth state
    setAuth({ isAuthenticated: false, email: null, role: null });
    
    // You can also make a server request to clear any server-side sessions if needed
    fetch(`${process.env.REACT_APP_BACKEND}/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(error => console.error('Error during logout:', error));
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading, checkAuthStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 