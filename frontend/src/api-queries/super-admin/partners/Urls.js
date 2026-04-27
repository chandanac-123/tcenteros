import { getPartnersOverview } from "./index";

export const getPartnersOverviewData = async (data) => {
  try {
    const response = await getPartnersOverview(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
