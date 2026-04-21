import { getNetworkingApiCall} from "./index";

export const getNetwork = async (data) => {
  try {
    const response = await getNetworkingApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};