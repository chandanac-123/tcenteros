import { partnerDashboardApiCall} from "./index";

export const getPartnerDashboard = async (data) => {
  try {
    const response = await partnerDashboardApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

