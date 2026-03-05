import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      const res = await api.get('/users/me');
      setUser(res.data.user);
    } catch (e) {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  async function signIn(username, password) {
    const res = await api.post('/users/signin', { username, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  }

  function signOut() {
    localStorage.removeItem('token');
    setUser(null);
  }

  useEffect(() => {
    refreshMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
