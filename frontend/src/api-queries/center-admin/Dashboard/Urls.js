import {
  dashboardApiCall,
  renewSubscriptionApiCall,
  changeSubscriptionApiCall,
  updateSubscriptionDetailsApiCall,
} from "./index";

export const getDashboardData = async () => {
  try {
    const response = await dashboardApiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRenewSubscriptionData = async () => {
  try {
    const response = await renewSubscriptionApiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changeSubscription = async (data) => {
  try {
    const response = await changeSubscriptionApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSubscriptionDetails = async (data) => {
  try {
    const response = await updateSubscriptionDetailsApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};