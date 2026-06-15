import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isSessionCheck = err.config?.url?.includes('/auth/me');
    if (err.response?.status === 401 && !isSessionCheck && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
