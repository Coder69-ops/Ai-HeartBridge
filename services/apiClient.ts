import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// Request queue to prevent too many simultaneous requests
let requestQueue: Array<() => void> = [];
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 3;

const processQueue = () => {
  if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    const nextRequest = requestQueue.shift();
    if (nextRequest) {
      activeRequests++;
      nextRequest();
    }
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for AI responses
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token and handle queuing
api.interceptors.request.use(
  (config) => {
    return new Promise((resolve) => {
      const executeRequest = () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        resolve(config);
      };

      if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
        requestQueue.push(executeRequest);
      } else {
        activeRequests++;
        executeRequest();
      }
    });
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth and rate limit errors
api.interceptors.response.use(
  (response) => {
    // Decrement active requests and process queue
    activeRequests--;
    processQueue();
    return response;
  },
  async (error) => {
    // Decrement active requests and process queue
    activeRequests--;
    processQueue();
    
    const originalRequest = error.config;
    
    // Handle rate limiting with exponential backoff
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryAfter = error.response.headers['retry-after'] || 2;
      const delay = Math.min(parseInt(retryAfter) * 1000, 10000); // Max 10 seconds
      
      console.log(`Rate limited. Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return api(originalRequest);
    }
    
    // Handle auth errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/'; // Redirect to login
    }
    
    // Handle non-JSON responses (like rate limit messages)
    if (error.response?.status === 429 && typeof error.response.data === 'string') {
      error.message = `Rate limit exceeded. Please try again later.`;
    }
    
    return Promise.reject(error);
  }
);

export default api;