import axiosInstance from "@api/axiosInstance";

export const partnerDashboardApiCall = () => axiosInstance.get(`/partner/dashboard`);
