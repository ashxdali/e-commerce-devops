import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Base URL retrieved cleanly from VITE_API_URL or relative fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Prepared for future JWT Auth token attachment in Part 3)
apiClient.interceptors.request.use(
  (config) => {
    // Note: Authentication header attachment will be implemented in Part 3
    // const token = localStorage.getItem('auth_token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for Centralized Client Handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Standard error formatting payload
    if (error.response) {
      console.warn(`[API Error] Status ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.warn('[API Error] No response received from server:', error.message);
    } else {
      console.warn('[API Error] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
