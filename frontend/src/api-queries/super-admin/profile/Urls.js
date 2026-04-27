import {
  getSuperadminProfileApiCall,
  updateSuperadminProfileApiCall,
} from "./index";

export const getSuperadminProfile = async () => {
  try {
    const response = await getSuperadminProfileApiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSuperadminProfile = async (data) => {
  try {
    const response = await updateSuperadminProfileApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
