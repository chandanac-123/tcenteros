import { getPartnerDashboard } from "./Urls";
import { useQuery} from "@tanstack/react-query";

export const usePartnerDashboardQuery = (data) => {
  return useQuery({
    queryKey: ["partnerDashboard", data],
    queryFn: () => getPartnerDashboard(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};