import axiosInstance from "@api/axiosInstance"


export const createGlobalTermsAndPrivacyApiCall = data =>
    axiosInstance.get(`/settings/superadmin/terms-privacy`,data);