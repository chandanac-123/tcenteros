import axiosInstance from "@api/axiosInstance";

export const dashboardApiCall = (data) =>
  axiosInstance.get(`/center/center/dashboard`, data);

export const renewSubscriptionApiCall = (data) =>
  axiosInstance.get(`/center/billing/subscription/renew/options`, data);

export const changeSubscriptionApiCall = (data) =>
  axiosInstance.post(`/center/billing/subscription/renew`, data);

export const updateSubscriptionDetailsApiCall = (data) =>
  axiosInstance.get(
    `/center/billing/subscription/package-preview?subscription_duration=${data}`,
  );
