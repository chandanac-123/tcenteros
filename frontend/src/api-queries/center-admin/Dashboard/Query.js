import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardData,
  getRenewSubscriptionData,
  changeSubscription,
} from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useRenewSubscriptionQuery = () => {
  return useQuery({
    queryKey: ["renewSubscription"],
    queryFn: getRenewSubscriptionData,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useChangeSubscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries(["renewSubscription"]);
      showSuccess("Subscription changed successfully");
    },
    onError: (error) => {
      showError(error.message || "Failed to change subscription");
    },
  });
};
