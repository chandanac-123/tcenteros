import { getBranchApiCall,createBranchPriceApiCall} from "./index";

export const getBranch = async (data) => {
  try {
    const response = await getBranchApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBranchPrice = async (data) => {
  try {
    const response = await createBranchPriceApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};