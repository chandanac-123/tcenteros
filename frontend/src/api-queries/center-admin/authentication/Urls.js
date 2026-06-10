import {
  createCenterAccountApiCall,
  emailResetPasswordApiCall,
  loginApiCall,
  requestOTPforgotPasswordApiCall,
  resetPasswordApiCall,
  verifyOTPforgotPasswordApiCall
} from "./index";

export const login = async (details) => {
  try {
    const response = await loginApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}


export const requestOTPforgotPassword = async (details) => {
  try {
    const response = await requestOTPforgotPasswordApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const verifyOTPforgotPassword = async (details) => {
  try {
    const response = await verifyOTPforgotPasswordApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}


export const resetPassword = async (details) => {
  try {
    const response = await resetPasswordApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createCenterAccount = async (details) => {
  try {
    const response = await createCenterAccountApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const emailResetPassword = async (details) => {
  try {
    const response = await emailResetPasswordApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}
