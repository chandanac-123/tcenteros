import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveSubscriptions, getSubscriptionById ,getRenewalCalendar} from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useSubscriptionsQuery = (data) => {
  return useQuery({
    queryKey: ["subscriptions", data],
    queryFn: () => getActiveSubscriptions(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useSubscriptionGetByIdQuery = (id) => {
  return useQuery({
    queryKey: ["subscriptions", id],
    queryFn: () => getSubscriptionById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useRenewalCalendarQuery = () => {
  return useQuery({
    queryKey: ["renewalCalendar"],
    queryFn: () => getRenewalCalendar(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
