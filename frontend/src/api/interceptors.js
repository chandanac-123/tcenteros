import axiosInstance from './axiosInstance';
import { useAuthStore } from '@store/authStore';

axiosInstance.interceptors.request.use(
  config => {
    // Get the accessToken from zustand store
    const state = useAuthStore.getState();
    const token = state.accessToken || state.auth?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Optionally, you can inject a logout handler here if needed
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 here if you want to clear the token or redirect
    return Promise.reject(error);
  }
);