import axiosInstance from "@api/axiosInstance"

export const loginApiCall = details =>
  axiosInstance.post('/auth/centeradmin/login', details)
export const requestOTPforgotPasswordApiCall = details =>
  axiosInstance.post('/auth/forgot-password/request-otp', details)
export const verifyOTPforgotPasswordApiCall = details =>
  axiosInstance.post('/auth/forgot-password/verify-otp', details)
export const resetPasswordApiCall = details => {
  return axiosInstance.post(
    '/auth/forgot-password/reset-password',
    details
  )
}
export const createCenterAccountApiCall = details =>
  axiosInstance.post('/auth/centeradmin/change-password', details)