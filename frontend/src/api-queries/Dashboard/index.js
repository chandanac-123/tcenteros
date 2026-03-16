import axiosInstance from '@api/axiosInstance'

export const dashboardApiCall = data =>
  axiosInstance.get(`/center/center/dashboard`, data)