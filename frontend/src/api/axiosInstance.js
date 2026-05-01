import axios from "axios";
import { useAuthStore } from "@store/authStore";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState();
    const token = state.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("error: ", error.response);
    const originalRequest = error.config;
    const state = useAuthStore.getState();

    //  FIX 1: handle no response safely
    if (!error?.response) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    //  FIX 2: only handle 401
    if (status !== 401) {
      return Promise.reject(error);
    }

    //  FIX 3: skip refresh for auth endpoints (login, refresh itself)
    if (originalRequest.url.includes("/auth")) {
      return Promise.reject(error);
    }

    //  FIX 4: prevent infinite loop (BUT DON'T CLEAR HERE)
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = state.refreshToken;

    //  ONLY logout if refresh token missing
    if (!refreshToken) {
      state.clearAuth();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // queue logic
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/auth/refresh`,
        { refresh_token: refreshToken },
      );

      const newAccess = response.data.access_token;
      const newRefresh = response.data.refresh_token;

      state.setAuth({
        access_token: newAccess,
        refresh_token: newRefresh,
      });

      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

      processQueue(null, newAccess);

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return axiosInstance(originalRequest);
    } catch (err) {
      //  ONLY HERE we logout
      processQueue(err, null);
      state.clearAuth();
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
