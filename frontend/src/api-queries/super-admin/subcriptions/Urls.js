import { getSubscriptionApiCall, getSubscriptionByIdApiCall,getRenewalApiCall ,getRenewalByIdApiCall} from "./index";

export const getActiveSubscriptions = async (data) => {
  try {
    const response = await getSubscriptionApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionById = async (id) => {
  try {
    const response = await getSubscriptionByIdApiCall(id);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getRenewalCalendar = async (data) => {
  try {
    const response = await getRenewalApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRenewalById = async (data) => {
  try {
    const response = await getRenewalByIdApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};