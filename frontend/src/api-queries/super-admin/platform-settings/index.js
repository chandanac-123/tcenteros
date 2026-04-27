import axiosInstance from "@api/axiosInstance";

export const createGlobalTermsAndPrivacyApiCall = (data) =>
  axiosInstance.post(`/branding/terms-privacy/global`, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

export const updatePlatformSettingsApiCall = (data) =>
  axiosInstance.put(`/platforms/platform/settings`, data);
export const getPlatformSettingsApiCall = (data) =>
  axiosInstance.get(`/platforms/platform/settings`, data);
