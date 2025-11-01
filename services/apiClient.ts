import axios from 'axios';
import { NetworkErrorHandler } from '../src/utils/networkErrorHandler';
import { getServerErrorMessage } from '../src/utils/formErrorHandler';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// Initialize network error handler
const networkHandler = NetworkErrorHandler.getInstance();

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

// Response interceptor to handle errors with therapeutic messaging
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check network status first
    if (!networkHandler.isNetworkAvailable()) {
      console.log('💔 Network unavailable - queuing request for retry');
      error.message = "We're having trouble connecting right now. Don't worry - your progress is safe and we'll reconnect automatically when your network is ready. Take a moment to breathe. 💚";
      return Promise.reject(error);
    }
    
    // Handle server-side rate limiting with therapeutic messaging
    if (error.response?.status === 429 && !originalRequest._retried) {
      originalRequest._retried = true;
      
      console.log('🌱 Taking a mindful pause - retrying in 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return api(originalRequest);
    }
    
    // Handle auth errors with supportive messaging
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      console.log('🔒 Session expired - redirecting to sign in');
      
      // Add therapeutic message to error
      error.therapeuticMessage = "It looks like your session has expired. Let's get you signed in again so you can continue your journey. 🔒";
      
      // Gentle redirect after a moment
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
    
    // Add therapeutic messaging to all errors
    if (error.response) {
      error.therapeuticMessage = getServerErrorMessage(error);
    } else {
      error.therapeuticMessage = "We're having trouble connecting right now 🌐 Please check your internet connection and we'll try again together.";
    }
    
    return Promise.reject(error);
  }
);

export default api;