import axiosInstance from "@api/axiosInstance";

export const getDesignationApiCall = (data) =>
  axiosInstance.get(`/superadmin/superadmin/platform/designations?page=${data?.page}`);
export const createDesignationApiCall = (details) =>
  axiosInstance.post(`/superadmin/superadmin/platform/designations`, details);
export const deleteDesignationApiCall = (id) =>
  axiosInstance.delete(`/superadmin/superadmin/platform/designations/${id}`);
export const getEmployeeApiCall = (data) =>
  axiosInstance.get(`/superadmin/superadmin/platform/employees?page=${data?.page}`);
export const createEmployeeApiCall = (details) =>
  axiosInstance.post(`/superadmin/superadmin/platform/employees`, details);
export const deleteEmployeeApiCall = (id) =>
  axiosInstance.delete(`/superadmin/superadmin/platform/employees/${id}`);

export const getPermissionApiCall = () =>
  axiosInstance.get(`/permissions/platform/designations/permissions`);
export const createPermissionApiCall = (details) =>
  axiosInstance.post(`/permissions/platform/designations/permissions`, details);
