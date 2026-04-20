import axiosInstance from "@api/axiosInstance"

export const getTaxApiCall = () =>
  axiosInstance.get(`/settings/superadmin/tax-categories/`)
export const createTaxApiCall = details =>
  axiosInstance.post('/settings/superadmin/tax-categories/', details)
export const updateTaxApiCall = (details, id) =>
  axiosInstance.put(`/settings/superadmin/tax-categories/${id}`, details)
export const deleteTaxApiCall = id =>
  axiosInstance.delete(`/settings/superadmin/tax-categories/${id}`)
export const getTaxByIdApiCall = id =>
  axiosInstance.get(`/settings/superadmin/tax-categories/${id}`)