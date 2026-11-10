import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30s — Render free tier can be slow on cold start
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('imboni_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('imboni_token');
    }
    return Promise.reject(err);
  }
);

export default api;
