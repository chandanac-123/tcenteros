import axiosInstance from "@api/axiosInstance";

export const getSuperadminProfileApiCall = () =>
  axiosInstance.get(`/platforms/superadmin/profile`);

export const updateSuperadminProfileApiCall = (data) =>
  axiosInstance.put(`/platforms/superadmin/profile`, data);

export const changePasswordApiCall = details =>
  axiosInstance.post('/auth/centeradmin/change-password', details)