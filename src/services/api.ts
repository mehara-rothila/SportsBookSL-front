// src/services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const USER_TOKEN_KEY = 'userToken'; // Use the same key as in authService
const USER_INFO_KEY = 'user';     // Key for storing user info

const api = axios.create({
  baseURL: API_URL,
  headers: {
    // Default Content-Type for most requests
    'Content-Type': 'application/json'
  }
});

// --- Request Interceptor ---
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(USER_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // console.log(`Interceptor: Attaching token for ${config.url}`);
      } else {
        // console.log(`Interceptor: No token found for ${config.url}`);
      }

      // IMPORTANT: If the data is FormData, remove the Content-Type header
      // Axios will set the correct multipart/form-data header with boundary
      if (config.data instanceof FormData) {
        // console.log(`Interceptor: Detected FormData for ${config.url}. Removing Content-Type header.`);
        delete config.headers['Content-Type'];
      } else if (!config.headers['Content-Type']) {
        // Ensure JSON Content-Type is set if not FormData and not already set
        config.headers['Content-Type'] = 'application/json';
      }
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("Interceptor Request Error:", error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => response, // Simply return successful responses
  (error: AxiosError) => {
    // console.error("Interceptor Response Error Status:", error.response?.status);
    // console.error("Interceptor Response Error Data:", error.response?.data);

    // Handle 401 Unauthorized specifically
    if (error.response && error.response.status === 401) {
      console.warn("Interceptor: Received 401 Unauthorized.");

      // Check if running in browser environment before accessing localStorage/window
      if (typeof window !== 'undefined') {
        const originalRequestUrl = error.config?.url;
        // Avoid clearing token/redirecting if the 401 came from login/register itself
        if (originalRequestUrl !== '/auth/login' && originalRequestUrl !== '/auth/register') {
          console.log("Interceptor: Clearing auth data due to 401 on protected route.");
          // Remove token/user info directly
          try {
            localStorage.removeItem(USER_TOKEN_KEY);
            localStorage.removeItem(USER_INFO_KEY);
            console.log("Interceptor: Cleared token and user info from localStorage.");
            // Redirect to login page
            // Use a slight delay to ensure state updates propagate if needed
            setTimeout(() => {
                 window.location.href = '/login?sessionExpired=true';
            }, 100);
          } catch (clearError) {
            console.error("Error during interceptor storage clear:", clearError);
          }
        } else {
            console.log("Interceptor: 401 received on auth route, not clearing token.");
        }
      }
    }
    // IMPORTANT: Reject the promise so the original caller's catch block still runs
    return Promise.reject(error);
  }
);


export default api;