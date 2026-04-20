import axiosInstance from "@api/axiosInstance"

export const getPermissionCall = () =>
  axiosInstance.get(`/permissions/designation/permissions`)
export const createPermissionApiCall = details =>
  axiosInstance.post('/permissions/designation/permissions', details)
