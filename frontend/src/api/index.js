import axiosInstance from './axiosInstance';

export const classTypeApiCall = () => axiosInstance.get('/settings/superadmin/center-categories/');
export const platformApiCall = () => axiosInstance.get('/platforms/');
export const onboardCreateApiCall = (details) => axiosInstance.post('/center/onboarding/temp', details);
export const pricingPageApiCall = (id) => axiosInstance.get(`/center/onboarding/temp${id}/`);
export const gsteApiCall = () => axiosInstance.get(`/center/onboarding/temp/calculate`);
export const onboardFinalizeApiCall = ({details,id}) => axiosInstance.post(`/center/billing/onboarding/finalize/${id}`, details);