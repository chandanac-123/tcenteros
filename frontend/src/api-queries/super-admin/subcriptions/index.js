import axiosInstance from "@api/axiosInstance";

export const getSubscriptionApiCall = (data) =>
  axiosInstance.get(`/superadmin/billing/subscriptions/details?page=${data?.page}`);
export const getSubscriptionByIdApiCall = (id) =>
  axiosInstance.get(`/superadmin/billing/center/${id}/subscription-detail`);

