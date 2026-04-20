import axiosInstance from "@api/axiosInstance"

export const getHolidayApiCall = () =>
  axiosInstance.get(`/settings/superadmin/center-holidays/`)
export const createHolidayApiCall = details =>
  axiosInstance.post('/settings/superadmin/center-holidays/', details)
export const deleteHolidayApiCall = id =>
  axiosInstance.delete(`/settings/superadmin/center-holidays/${id}`)