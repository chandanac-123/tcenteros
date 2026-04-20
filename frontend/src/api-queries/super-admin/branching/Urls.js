import { getBranchApiCall} from "./index";

export const getBranch = async (data) => {
  try {
    const response = await getBranchApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};