import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRevenueBillingOverview, runAllCommissions } from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useRevenueBillingOverviewQuery = () => {
  return useQuery({
    queryKey: ["revenueBillingOverview"],
    queryFn: () => getRevenueBillingOverview(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useRunAllCommissionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => runAllCommissions(),
    onSuccess: () => {
      showSuccess("All commissions run successfully");
      queryClient.invalidateQueries(["revenueBillingOverview"]);
    },
    onError: (error) => {
      showError(
        error?.response?.data?.detail ||
          "Error occurred while running commissions",
      );
    },
  });
};
