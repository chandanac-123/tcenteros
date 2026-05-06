import axiosInstance from "@api/axiosInstance";

export const onboardPartnerDetailApiCall = (details) =>
  axiosInstance.post("/partner/onboarding", details);

export const onboardPaymentFeeApiCall = (data) =>
  axiosInstance.get(`/partner/onboarding/fee?email=${data}`);

export const onboardPartnerPaymentApiCall = (id) =>
  axiosInstance.post(`/partner/onboarding/${id}/pay`);

export const onboardPaymentSuccessApiCall = (id) =>
  axiosInstance.get(`/partner/onboarding/${id}`);

export const partnerLandingApiCall = () =>
  axiosInstance.get(`/partner/superadmin/partners/landing-overview`);