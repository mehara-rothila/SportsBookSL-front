// src/hooks/useAuth.tsx
'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '@/services/authService';

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const auth = isAuthenticated();
      setIsLoggedIn(auth);
      
      if (auth) {
        const userData = getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    checkAuth();

    // Listen for auth events
    const handleLogin = () => checkAuth();
    const handleLogout = () => checkAuth();
    const handleUpdate = () => checkAuth();

    window.addEventListener('user-login', handleLogin);
    window.addEventListener('user-logout', handleLogout);
    window.addEventListener('user-updated', handleUpdate);

    return () => {
      window.removeEventListener('user-login', handleLogin);
      window.removeEventListener('user-logout', handleLogout);
      window.removeEventListener('user-updated', handleUpdate);
    };
  }, []);

  return { 
    user, 
    isAuthenticated: isLoggedIn, 
    loading,
    isAdmin: user?.role === 'admin',
    isTrainer: user?.role === 'trainer',
  };
}