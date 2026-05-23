import axiosInstance from "@api/axiosInstance";

export const accountApiCall = () => axiosInstance.get(`/partner/bank-details`);

export const addAccountApiCall = (detail) =>
  axiosInstance.post(`/partner/bank-details`, detail);

export const deleteAccountApiCall = () =>
  axiosInstance.delete(`/partner/bank-details`);
