import {
  createCenterAccountApiCall,
  loginApiCall,
  requestOTPforgotPasswordApiCall,
  resetPasswordApiCall,
  verifyOTPforgotPasswordApiCall
} from "../../api/index";

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
    // console.error("Error at requestOTPforgotPassword() api-queries/authentication/Urls.js::", error);
    throw error
  }
}

export const verifyOTPforgotPassword = async (details) => {
  try {
    const response = await verifyOTPforgotPasswordApiCall(details)
    return response.data
  } catch (error) {
    // console.error("Error at verifyOTPforgotPassword() api-queries/authentication/Urls.js::", error);
    throw error
  }
}


export const resetPassword = async (details) => {
  try {
    const response = await resetPasswordApiCall(details)
    return response.data
  } catch (error) {
    // console.error("Error at resetPassword() api-queries/authentication/Urls.js::", error);
    throw error
  }
}

export const createCenterAccount = async (details) => {
  try {
    const response = await createCenterAccountApiCall(details)
    return response.data
  } catch (error) {
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message);
    console.error("Full Error:", error.response?.data);
    console.error("Error at createCenterAccount() api-queries/authentication/Urls.js::", error);
    throw error
  }
}