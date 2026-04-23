import { renewalApiCall ,exportApiCall} from "./index";

export const getRenewals = async (data) => {
  try {
    const response = await renewalApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportEarningsAndPayouts = async (data) => {
  try {
    const response = await exportApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
