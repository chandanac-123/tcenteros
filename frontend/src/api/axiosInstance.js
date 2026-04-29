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
    const originalRequest = error.config;
    const state = useAuthStore.getState();

    // handle no response (network error)
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // prevent infinite loop
    if (originalRequest._retry) {
      state.clearAuth();
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    const refreshToken = state.refreshToken;

    if (!refreshToken) {
      state.clearAuth();
      return Promise.reject(error);
    }

    // queue requests while refreshing
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
        {
          refresh_token: refreshToken,
        },
      );

      const newAccess = response.data.access_token;
      const newRefresh = response.data.refresh_token;

      //FIXED: correct keys
      state.setAuth({
        access_token: newAccess,
        refresh_token: newRefresh,
      });

      // FIXED: correct header update
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

      processQueue(null, newAccess);

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return axiosInstance(originalRequest);
    } catch (err) {
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
