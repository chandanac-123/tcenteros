import axiosInstance from './axiosInstance'

export const classTypeApiCall = () =>
  axiosInstance.get('/settings/superadmin/center-categories/')
export const platformApiCall = () => axiosInstance.get('/platforms/')
export const onboardCreateApiCall = details =>
  axiosInstance.post('/center/onboarding/temp', details)
export const pricingPageApiCall = id =>
  axiosInstance.get(`/center/onboarding/temp/${id}`)
export const gsteApiCall = id =>
  axiosInstance.get(`/center/onboarding/calculate?onboarding_id=${id}`)
export const onboardFinalizeApiCall = (details, id) =>
  axiosInstance.post(`/center/billing/onboarding/finalize/${id}`, details)

// EmployeeManagement
export const getEmployeeCategoriesApiCall = () =>
  axiosInstance.get('/settings/superadmin/designation')
export const CreateEmployeeCategoriesApiCall = details =>
  axiosInstance.post('/settings/superadmin/designation', details, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const getEmployeeApiCall = () => axiosInstance.get('/auth/employee')
export const createEmployeeApiCall = details =>
  axiosInstance.post('/auth/employee', details)
export const updateEmployeeApiCall = (details, id) =>
  axiosInstance.put(`/auth/employee/employee_id=${id}`, details)
export const deleteEmployeeApiCall = id =>
  axiosInstance.delete(`/auth/employee/employee_id=${id}`)