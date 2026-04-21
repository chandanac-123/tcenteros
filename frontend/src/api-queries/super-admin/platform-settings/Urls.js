import { createGlobalTermsAndPrivacyApiCall } from "./index"



export const createGlobalTermsAndPrivacy = async () => {
  try {
    const response = await createGlobalTermsAndPrivacyApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}
