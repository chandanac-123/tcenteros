import axiosInstance from "@api/axiosInstance";

export const renewalApiCall = (data) =>
  axiosInstance.get(`/partner/subscriptions/renewals/expired`);

export const exportApiCall = () =>
  axiosInstance.get(`/partner/leads/transactions/export/pdf`, {
    responseType: "blob",
  });
