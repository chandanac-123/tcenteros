import axiosInstance from "@api/axiosInstance";

export const earningAndPayoutApiCall = (data) =>
  axiosInstance.get(`/partner/leads/transactions`);

export const exportApiCall = () =>
  axiosInstance.get(`/partner/leads/transactions/export/pdf`, {
    responseType: "blob",
  });
