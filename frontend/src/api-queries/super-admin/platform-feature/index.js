import axiosInstance from "@api/axiosInstance";


export const addPlatformFeatures = (data) =>
    axiosInstance.post('/platforms/', data)

export const getPlatformFeatureById = (id) =>
    axiosInstance.get(`/platforms/${id}`);

export const updatePlatformFeature = (id, data) =>
    axiosInstance.put(`/platforms/${id}`, data);

export const deletePlatformFeature = (id) =>
    axiosInstance.delete(`/platforms/${id}`);

export const getPlatformFeatures = () =>
    axiosInstance.get("/superadmin/superadmin/platform/features");