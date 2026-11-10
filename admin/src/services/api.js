import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30s — Render free tier can be slow on cold start
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('imboni_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('imboni_admin_token');
      window.location.href = '/login';
    }
    // If network error (server unreachable), show helpful message
    if (!err.response && err.message === 'Network Error') {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      console.error(`Cannot reach API at ${apiUrl}. Check if VITE_API_URL is set correctly.`);
    }
    return Promise.reject(err);
  }
);

export default api;
