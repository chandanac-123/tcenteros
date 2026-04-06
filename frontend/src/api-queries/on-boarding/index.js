import axiosInstance from "@api/axiosInstance"

export const classTypeApiCall = () =>
  axiosInstance.get('/settings/superadmin/center-categories/')
export const platformApiCall = () => axiosInstance.get('/platforms/')
export const getPlatformApiCall = id => axiosInstance.get(`/platforms/${id}`)
export const onboardCreateApiCall = details =>
  axiosInstance.post('/center/onboarding/temp', details)
export const pricingPageApiCall = id =>
  axiosInstance.get(`/center/onboarding/temp/${id}`)
export const gsteApiCall = id =>
  axiosInstance.get(`/center/onboarding/calculate?onboarding_id=${id}`)
export const onboardFinalizeApiCall = (details, id) =>
  axiosInstance.post(`/center/billing/onboarding/finalize/${id}`, details)