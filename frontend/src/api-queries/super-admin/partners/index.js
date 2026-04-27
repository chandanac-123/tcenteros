import axiosInstance from "@api/axiosInstance";

export const getPartnersOverview = (data) =>
  axiosInstance.get(`/partner/superadmin/partners/overview`, data);
export const getPartnerDetails = (id, data) =>
  axiosInstance.get(`/partner/superadmin/partners/${id}/details`, data);