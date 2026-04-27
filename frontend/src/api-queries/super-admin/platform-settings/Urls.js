import {
  createGlobalTermsAndPrivacyApiCall,
  getPlatformSettingsApiCall,
  updatePlatformSettingsApiCall,
} from "./index";

export const createGlobalTermsAndPrivacy = async (data) => {
  try {
    const response = await createGlobalTermsAndPrivacyApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePlatformSettings = async (data) => {
  try {
    const response = await updatePlatformSettingsApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPlatformSettings = async () => {
  try {
    const response = await getPlatformSettingsApiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};
