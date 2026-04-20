import { getSubscriptionApiCall, getSubscriptionByIdApiCall,getRenewalApiCall } from "./index";

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


export const getRenewalCalendar = async () => {
  try {
    const response = await getRenewalApiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};
