import axiosInstance from "@api/axiosInstance";

export const getSubscriptionApiCall = (data) =>
  axiosInstance.get(`/superadmin/billing/subscriptions/details?page=${data?.page}`);
export const getSubscriptionByIdApiCall = (id) =>
  axiosInstance.get(`/superadmin/billing/center/${id}/subscription-detail`);


export const getRenewalApiCall = (data) =>
  axiosInstance.get(`/superadmin/superadmin/billing/renewal-calendar?year=${data?.year}&month=${data?.month}`);
export const getRenewalByIdApiCall = (data) =>
  axiosInstance.get(`/superadmin/superadmin/billing/renewal-calendar/day-details?target_date=${data}`);
