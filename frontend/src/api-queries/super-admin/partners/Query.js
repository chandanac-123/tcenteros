import { showError, showSuccess } from "@utils/toast";
import { getPartnersOverviewData } from "./Urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetPartnersOverviewQuery = (data) => {
  return useQuery({
    queryKey: ["partnersOverview",data],
    queryFn: () => getPartnersOverviewData(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
