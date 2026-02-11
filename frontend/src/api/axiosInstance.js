import axios from 'axios'
import { useAuthStore } from '@store/authStore'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json'
  }
})

axiosInstance.interceptors.request.use(
  config => {
    // Get the accessToken from zustand store
    const state = useAuthStore.getState()
    // Try to get token from both accessToken and auth object
    const token = state?.accessToken || state?.auth?.access_token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }
    return config
  },
  error => Promise.reject(error)
)

// Optionally, you can inject a logout handler here if needed
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Clear auth store and redirect to login
      const state = useAuthStore.getState()
      if (state.clearAuth) state.clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
