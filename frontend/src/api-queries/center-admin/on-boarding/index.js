import axiosInstance from "@api/axiosInstance";

export const classTypeApiCall = () =>
  axiosInstance.get("/settings/superadmin/center-categories/");
export const platformApiCall = () => axiosInstance.get("/platforms/");
export const getPlatformApiCall = (id) => axiosInstance.get(`/platforms/${id}`);
export const onboardCreateApiCall = (details) =>
  axiosInstance.post("/center/onboarding/temp", details);
export const pricingPageApiCall = (id) =>
  axiosInstance.get(`/center/onboarding/temp/${id}`);
export const gsteApiCall = (id) =>
  axiosInstance.get(`/center/onboarding/calculate?onboarding_id=${id}`);
export const onboardFinalizeApiCall = (details, id) =>
  axiosInstance.post(`/center/billing/onboarding/finalize/${id}`, details);
export const getInvoiceApiCall = (id) =>
  axiosInstance.get(`/center/billing/invoice?invoice_id=${id}`);

export const getResellerApiCall = () =>
  axiosInstance.get("/center/partners");
export const getAllCentersOnBoarding = () =>
  axiosInstance.get(`/center/centers-all`)

export const razorpayFailureApiCall = (data) =>
  axiosInstance.post(`/auth/payment-failed?payment_order_id=${data}`)

export const retryRazorpayPaymentApiCall = ({ onboardId, paymentId }) =>
  axiosInstance.post(
    `/auth/payment/retry/${onboardId}/${paymentId}`
  );