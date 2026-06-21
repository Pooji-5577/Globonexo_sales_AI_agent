'use client';

import { createContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        setOrganization(res.data.organization);
      })
      .catch(() => {
        setUser(null);
        setOrganization(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    setOrganization(res.data.organization);
    return res.data;
  };

  const signup = async (payload) => {
    const res = await api.post('/auth/signup', payload);
    setUser(res.data.user);
    setOrganization(res.data.organization);
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider value={{ user, organization, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
