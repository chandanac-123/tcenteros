import axiosInstance from "@api/axiosInstance"


export const createGlobalTermsAndPrivacyApiCall = data =>
    axiosInstance.post(`/branding/terms-privacy/global`, data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });