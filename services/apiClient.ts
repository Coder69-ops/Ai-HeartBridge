import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for AI responses
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth and server rate limit errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle server-side rate limiting with a single retry after delay
    if (error.response?.status === 429 && !originalRequest._retried) {
      originalRequest._retried = true;
      
      // Wait 3 seconds and retry once
      console.log('Server rate limited. Retrying in 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return api(originalRequest);
    }
    
    // Handle auth errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/'; // Redirect to login
    }
    
    return Promise.reject(error);
  }
);

export default api;