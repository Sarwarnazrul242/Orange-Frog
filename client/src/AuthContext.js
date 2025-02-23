import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    email: null,
    role: null,
    userId: null, // Add userId here
    token: null, // JWT token
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token'); // JWT token stored in localStorage
    if (token) {
      // You can also validate the token here by making an API call or decoding it
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT
      setAuth({
        isAuthenticated: true,
        email: decodedToken.email,
        role: decodedToken.role,
        userId: decodedToken.userId,
        token: token
      });
    } else {
      setAuth({ isAuthenticated: false, email: null, role: null, userId: null, token: null });
    }
    setLoading(false);
  };

  const login = (email, role, userId, token) => {
    localStorage.setItem('token', token); // Save JWT in localStorage
    setAuth({ isAuthenticated: true, email, role, userId, token });
  };

  const logout = () => {
    localStorage.removeItem('token'); // Remove JWT from localStorage
    setAuth({ isAuthenticated: false, email: null, role: null, userId: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading, checkAuthStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
