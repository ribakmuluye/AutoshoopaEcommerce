import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage auth state
    try {
      const authState = localStorage.getItem('auth');
      if (authState) {
        const parsed = JSON.parse(authState);
        const token = parsed.user?.token || parsed.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error('Error loading token in interceptor:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
