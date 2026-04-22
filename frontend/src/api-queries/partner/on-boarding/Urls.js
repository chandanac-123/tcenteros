import {
 
  onboardPartnerDetailApiCall,
  onboardPartnerPaymentApiCall,
  onboardPaymentFeeApiCall,
  onboardPaymentSuccessApiCall
} from './index'


export const createOnboardingDetails = async (details) => {
  try {
    const response = await onboardPartnerDetailApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPaymentFee = async () => {
  try {
    const response = await onboardPaymentFeeApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createOnboardingPayment = async (id, details) => {
  try {
    const response = await onboardPartnerPaymentApiCall(id, details)
    return response.data
  } catch (error) {
    throw error
  }
}
export const getPaymentSuccess = async (id) => {
  try {
    const response = await onboardPaymentSuccessApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}
