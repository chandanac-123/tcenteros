import { createBrandingApiCall, createTermsandPrivacyApiCall, getBrandingApiCall, getTermsandPrivacyApiCall } from '../../api/index'

export const getBrand = async () => {
  try {
    const response = await getBrandingApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createBrand = async details => {
  try {
    const response = await createBrandingApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getTermsandPrivacy = async details => {
  try {
    const response = await getTermsandPrivacyApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}
export const createTermsandPrivacy = async details => {
  try {
    const response = await createTermsandPrivacyApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

