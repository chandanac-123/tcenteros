import { getSubscriptionApiCall, getSubscriptionByIdApiCall } from "./index";

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
