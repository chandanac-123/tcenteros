import axiosInstance from "@api/axiosInstance";

export const getDesignationApiCall = (data) =>
  axiosInstance.get(`/superadmin/superadmin/platform/designations?page=${data?.page}`);
export const createDesignationApiCall = (details) =>
  axiosInstance.post(`/superadmin/superadmin/platform/designations`, details);
export const getEmployeeApiCall = (data) =>
  axiosInstance.get(`/superadmin/superadmin/platform/employees?page=${data?.page}`);
export const createEmployeeApiCall = (details) =>
  axiosInstance.post(`/superadmin/superadmin/platform/employees`, details);