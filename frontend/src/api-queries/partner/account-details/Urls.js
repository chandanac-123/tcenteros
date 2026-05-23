import { addAccountApiCall, accountApiCall ,deleteAccountApiCall} from "./index";

export const getAccountDetails = async () => {
  try {
    const response = await accountApiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addAccountDetails = async (data) => {
  try {
    const response = await addAccountApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const deleteAccountDetails = async () => {
  try {
    const response = await deleteAccountApiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};