import { getPartnersOverview ,getPartnerDetails} from "./index";

export const getPartnersOverviewData = async (data) => {
  try {
    const response = await getPartnersOverview(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPartnerDetailsData = async (id, data) => {
  try {
    const response = await getPartnerDetails(id, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
