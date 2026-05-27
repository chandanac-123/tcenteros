import {
  createCenterTypeApiCall,
  createFAQs,
  createGlobalTermsAndPrivacyApiCall,
  deleteCenterTypeApiCall,
  deleteFAQApiCall,
  getAllFAQs,
  getCenterTypeApiCall,
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

export const getCenterType = async () => {
  try {
    const response = await getCenterTypeApiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCenterType = async (data) => {
  try {
    const response = await createCenterTypeApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCenterType = async (id) => {
  try {
    const response = await deleteCenterTypeApiCall(id);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const createNewFAQs = async (data) => {
  try {
    const response = await createFAQs(data);
    return response.data;
  } catch (err) {
    console.log("Error at the creating FAQs", err);
    throw err
  }
}

export const listAllFAQs = async () => {
  try {
    const response = await getAllFAQs();
    return response.data;
  } catch (err) {
    console.log("Error at the getting FAQs", err);
    throw err
  }
}

export const deleteFAQ = async (id) => {
  try {
    const response = await deleteFAQApiCall(id);
    return response.data;
  } catch (error) {
    throw error;
  }
};