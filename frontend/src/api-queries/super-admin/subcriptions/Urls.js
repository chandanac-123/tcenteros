import {
  getSubscriptionApiCall,
  getSubscriptionByIdApiCall,
  getRenewalApiCall,
  getRenewalByIdApiCall,
  getRenewalExpiringApiCall,
  getBillingHistoryApiCall,
  suspendCenterApiCall,
  sendReminderApiCall,
  failedSubscriptionApiCall,
  suspendTheSubscription,
  listSuspendedSubscription,
  getNetworkOnlyApiCall
} from "./index";

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

export const getRenewalExpiring = async (data) => {
  try {
    const response = await getRenewalExpiringApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBillingHistory = async (data) => {
  try {
    const response = await getBillingHistoryApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const suspendCenter = async (id, details) => {
  try {
    const response = await suspendCenterApiCall(id, details);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendReminder = async (id) => {
  try {
    const response = sendReminderApiCall(id);
    return response;
  } catch (err) {
    throw err
  } 1
}

export const getFailedSubList = async (details) => {
  try {
    const response = await failedSubscriptionApiCall(details);
    return response.data; 
  } catch (err) {
    throw err;
  }
};

export const makeSuspendSubscribe = async (id) => {
  try {
    const response = await suspendTheSubscription(id);
    return response.data;
  } catch (err) {
    throw err;
  }
}

export const suspendedSubscribeList = async () => {
  try {
    const response = await listSuspendedSubscription();
    return response.data;
  } catch (err) {
    throw err;
  }
}

export const getNetworkOnly = async (data) => {
  try {
    const response = await getNetworkOnlyApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};