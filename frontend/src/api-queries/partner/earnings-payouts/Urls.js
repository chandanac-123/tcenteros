import { earningAndPayoutApiCall ,exportApiCall} from "./index";

export const getEarningsAndPayouts = async (data) => {
  try {
    const response = await earningAndPayoutApiCall(data);
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
