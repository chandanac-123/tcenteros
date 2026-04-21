import { createGlobalTermsAndPrivacyApiCall } from "./index"



export const createGlobalTermsAndPrivacy = async data => {
  try {
    const response = await createGlobalTermsAndPrivacyApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}
