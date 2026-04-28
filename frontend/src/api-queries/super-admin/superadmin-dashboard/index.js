import axiosInstance from "@api/axiosInstance";

export const getDashboardOverviewApiCall = () =>
  axiosInstance.get(`/superadmin/superadmin/dashboard/overview`);

