import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isSessionCheck = url.includes('/auth/me');
    const isAuthEndpoint = url.includes('/auth/');

    if (err.response?.status === 401 && !isSessionCheck && !isAuthEndpoint && typeof window !== 'undefined') {
      const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
      window.location.assign(`/login?next=${next}`);
    }

    return Promise.reject(err);
  }
);

export { API_BASE_URL };
export default api;
