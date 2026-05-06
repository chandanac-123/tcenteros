import {
 
  onboardPartnerDetailApiCall,
  onboardPartnerPaymentApiCall,
  onboardPaymentFeeApiCall,
  onboardPaymentSuccessApiCall,
  partnerLandingApiCall
} from './index'


export const createOnboardingDetails = async (details) => {
  try {
    const response = await onboardPartnerDetailApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPaymentFee = async (data) => {
  try {
    const response = await onboardPaymentFeeApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createOnboardingPayment = async (id) => {
  try {
    const response = await onboardPartnerPaymentApiCall(id)
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

export const getPartnerLandingData = async () => {
  try {
    const response = await partnerLandingApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}