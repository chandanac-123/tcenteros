import axiosInstance from "@api/axiosInstance";

export const onboardPartnerDetailApiCall = (details) =>
  axiosInstance.post("/partner/onboarding", details);

export const onboardPaymentFeeApiCall = (data) =>
  axiosInstance.get("/partner/onboarding/fee", data);

export const onboardPartnerPaymentApiCall = (id, details) =>
  axiosInstance.post(`/partner/onboarding/${id}/pay`, details);

export const onboardPaymentSuccessApiCall = (data) =>
  axiosInstance.get("/partner/onboarding/id", data);
