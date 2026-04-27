import { getRevenueBillingOverviewApiCall } from "./index";

export const getRevenueBillingOverview = async () => {
  try {
    const response = await getRevenueBillingOverviewApiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};
