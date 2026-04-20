import axiosInstance from "@api/axiosInstance"

export const getCenterTimeApiCall = () =>
  axiosInstance.get(`/settings/superadmin/center-operational-settings/`)
export const createCenterTimeApiCall = details =>
  axiosInstance.post(
    '/settings/superadmin/center-operational-settings/',
    details
  )
export const deleteCenterTimeApiCall = id =>
  axiosInstance.delete(`/settings/superadmin/center-operational-settings/${id}`)
export const updateCenterTimeApiCall = details =>
  axiosInstance.put(
    `/settings/superadmin/center-operational-settings/`,
    details
  )