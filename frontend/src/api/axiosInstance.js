import axios from 'axios'
import { useAuthStore } from '@store/authStore'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json'
  }
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

//  REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  config => {
    const state = useAuthStore.getState()
    const token = state.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// RESPONSE INTERCEPTOR (REFRESH LOGIC)
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const state = useAuthStore.getState()
    // If not 401 → reject
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }
    //  Prevent infinite loop
    if (originalRequest._retry) {
      state.clearAuth()
      return Promise.reject(error)
    }
    originalRequest._retry = true
    const refreshToken = state.refreshToken
    if (!refreshToken) {
      state.clearAuth()
      return Promise.reject(error)
    }

    //  If already refreshing → queue requests
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        })
        .catch(err => Promise.reject(err))
    }
    isRefreshing = true
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/auth/refresh`,
        {
          refresh_token: refreshToken
        }
      )
      const newAccess = response.data.access
      const newRefresh = response.data.refresh

      // Update Zustand
      state.setAuth({
        access_token: newAccess,
        refresh_token: newRefresh
      })
      axiosInstance.defaults.headers.Authorization = `Bearer ${newAccess}`
      processQueue(null, newAccess)
      originalRequest.headers.Authorization = `Bearer ${newAccess}`
      return axiosInstance(originalRequest)
    } catch (err) {
      processQueue(err, null)
      state.clearAuth()
      // optional redirect
      window.location.href = '/login'
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance
