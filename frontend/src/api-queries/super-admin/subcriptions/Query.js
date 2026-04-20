import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveSubscriptions, getSubscriptionById ,getRenewalCalendar,getRenewalById} from "./Urls";
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

export const useRenewalCalendarQuery = (data) => {
  return useQuery({
    queryKey: ["renewalCalendar", data],
    queryFn: () => getRenewalCalendar(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useRenewalByIdQuery = (data) => {
  return useQuery({
    queryKey: ["renewalCalendar", data],
    queryFn: () => getRenewalById(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
