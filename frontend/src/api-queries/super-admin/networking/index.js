import axiosInstance from "@api/axiosInstance";

export const getNetworkingApiCall = (data) =>
  axiosInstance.get(`/superadmin/superadmin/networking/platform-commissions?page=${data?.page}&status=${data?.status}`);
