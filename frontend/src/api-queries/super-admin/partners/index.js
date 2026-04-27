import axiosInstance from "@api/axiosInstance";

export const getPartnersOverview = (data) =>
  axiosInstance.get(`/partner/superadmin/partners/overview`, data);
