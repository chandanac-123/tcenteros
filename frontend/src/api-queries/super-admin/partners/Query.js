import { showError, showSuccess } from "@utils/toast";
import { getPartnersOverviewData,getPartnerDetailsData } from "./Urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetPartnersOverviewQuery = (data) => {
  return useQuery({
    queryKey: ["partnersOverview",data],
    queryFn: () => getPartnersOverviewData(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useGetPartnerDetailsQuery = (id, data) => {
  return useQuery({
    queryKey: ["partnersOverview", id, data],
    queryFn: () => getPartnerDetailsData(id, data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
