import axiosInstance from "@api/axiosInstance"

export const getBrandingApiCall = id =>
  axiosInstance.get(`/branding/branding/white-label/all`)
export const createBrandingApiCall = details =>
  axiosInstance.post(`/branding/branding/white-label/bulk-update`, details)
export const getTermsandPrivacyApiCall = id =>
  axiosInstance.get(`/branding/terms-privacy/global`)
export const createTermsandPrivacyApiCall = details =>
  axiosInstance.post(`/branding/terms-privacy/center`, details, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
export const getUpdatedTermsandPrivacyApiCall = () =>
  axiosInstance.get(`/branding/terms-privacy/center`)