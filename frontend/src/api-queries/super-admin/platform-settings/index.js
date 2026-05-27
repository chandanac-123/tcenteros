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

export const getCenterTypeApiCall = () =>
  axiosInstance.get(`/settings/superadmin/center-categories/`);
export const createCenterTypeApiCall = (data) =>
  axiosInstance.post(`/settings/superadmin/center-categories/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const deleteCenterTypeApiCall = (id) =>
  axiosInstance.delete(`/settings/superadmin/center-categories/${id}`);
export const createFAQs = (data) =>
  axiosInstance.post(`/settings/superadmin/faqs`, data);
export const getAllFAQs = () =>
  axiosInstance.get(`/settings/superadmin/faqs`)
export const deleteFAQApiCall = (id) =>
  axiosInstance.delete(`/settings/superadmin/faqs/${id}`);