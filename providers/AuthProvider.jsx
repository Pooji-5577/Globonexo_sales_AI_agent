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

  const startLogin = async (email) => {
    await api.post('/auth/login/start', { email });
  };

  const verifyLogin = async (email, otp) => {
    const res = await api.post('/auth/login/verify', { email, otp });
    setUser(res.data.user);
    setOrganization(res.data.organization);
    return res.data;
  };

  const startSignup = async (payload) => {
    await api.post('/auth/signup/start', payload);
  };

  const verifySignup = async (email, otp) => {
    const res = await api.post('/auth/signup/verify', { email, otp });
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
    <AuthContext.Provider value={{ user, organization, loading, startLogin, verifyLogin, startSignup, verifySignup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
