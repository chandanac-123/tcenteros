import {
  addNetworkAmountApiCall,
  deleteNetworkBookingApiCall,
  editApproveNetworkApiCall,
  getNetworkingBookingByIdApiCall,
  getNetworkToggleStatusApiCall,
  getUserNetworkListApiCall,
  networkToggleButtonApiCall,
  getNetworkAmountApiCall,
} from "./index";

export const addNetworkAmount = async (data) => {
  try {
    const response = await addNetworkAmountApiCall(data);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const networkToggleButton = async (enabled) => {
  try {
    const response = await networkToggleButtonApiCall(enabled);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getNetworkToggleButton = async () => {
  try {
    const response = await getNetworkToggleStatusApiCall();
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getUserNetworkList = async (data) => {
  try {
    const response = await getUserNetworkListApiCall(data);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const editApproveStatusNetwork = async (id) => {
  try {
    const response = await editApproveNetworkApiCall(id);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getNetworkingBookingById = async (id) => {
  try {
    const response = await getNetworkingBookingByIdApiCall(id);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const deleteNetworkBooking = async (id) => {
  try {
    const response = await deleteNetworkBookingApiCall(id);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getNetworkAmount = async (id) => {
  try {
    const response = await getNetworkAmountApiCall(id);
    return response.data;
  } catch (err) {
    throw err;
  }
};
