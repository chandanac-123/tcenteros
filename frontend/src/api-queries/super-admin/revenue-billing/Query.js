import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRevenueBillingOverview } from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useRevenueBillingOverviewQuery = () => {
  return useQuery({
    queryKey: ["revenueBillingOverview"],
    queryFn: () => getRevenueBillingOverview(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
