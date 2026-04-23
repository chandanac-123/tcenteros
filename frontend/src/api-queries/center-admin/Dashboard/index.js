import axiosInstance from '@api/axiosInstance'

export const dashboardApiCall = data =>
  axiosInstance.get(`/center/center/dashboard`, data)

export const renewSubscriptionApiCall = data =>
  axiosInstance.get(`/center/billing/subscription/renew/options`, data)