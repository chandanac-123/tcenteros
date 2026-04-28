import { getDashboardOverviewApiCall } from "./index";

export const getDashboardOverview = async () => {
  try {
    const response = await getDashboardOverviewApiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};
