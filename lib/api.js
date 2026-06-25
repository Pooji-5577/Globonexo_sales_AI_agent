import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/');
    if (err.response?.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
