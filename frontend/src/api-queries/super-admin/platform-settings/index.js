import axiosInstance from "@api/axiosInstance"


export const createGlobalTermsAndPrivacyApiCall = data =>
    axiosInstance.get(`/branding/terms-privacy/global`,data);