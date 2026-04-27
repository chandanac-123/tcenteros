import axiosInstance from "@api/axiosInstance";

export const getRevenueBillingOverviewApiCall = () =>
  axiosInstance.get(`/superadmin/superadmin/platform/revenue-billing/overview`);

