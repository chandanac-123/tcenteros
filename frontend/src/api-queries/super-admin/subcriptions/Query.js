import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getActiveSubscriptions,
  getSubscriptionById,
  getRenewalCalendar,
  getRenewalById,
  getRenewalExpiring,
  getBillingHistory,
  suspendCenter,
  sendReminder,
  getFailedSubList,
  makeSuspendSubscribe,
  suspendedSubscribeList,
} from "./Urls";
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

export const useRenewalExpiringQuery = (data) => {
  return useQuery({
    queryKey: ["renewalExpiring", data],
    queryFn: () => getRenewalExpiring(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useBillingHistoryQuery = (id) => {
  return useQuery({
    queryKey: ["billingHistory", id],
    queryFn: () => getBillingHistory(id),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useSuspendCenterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, details }) => suspendCenter(id, details),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      showSuccess(data?.detail || "Center suspended successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.detail || "Failed to suspend center");
      return err;
    },
  });
};


export const useSendReminder = () => {
  return useMutation({
    mutationFn: (id) => sendReminder(id),

    onSuccess: () => {
      console.log("Reminder sent successfully");
      showSuccess("Send the reminder to the center")
    },

    onError: (error) => {
      console.error("Failed to send reminder", error);
      showError(error?.response?.data?.detail || "Failed to send reminder to center");
    },
  });
};


export const useFailedSubscriptionsQuery = (params) => {
  return useQuery({
    queryKey: ["failed-subscriptions", params],
    queryFn: () => getFailedSubList(params),
  });
};


export const useSuspendSubscriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => makeSuspendSubscribe(id),

    onSuccess: (data, id) => {
      console.log("Suspended successfully:", data);
      showSuccess(data?.message)
      queryClient.invalidateQueries({
        queryKey: ["failed-subscriptions"],
      });
    },

    onError: (error) => {
      console.error("Suspend failed:", error);
    },
  });
};

export const useSuspendedSubscriptionsQuery = () => {
  return useQuery({
    queryKey: ["suspended-subscriptions"],

    queryFn: suspendedSubscribeList,

    staleTime: 1000 * 60 * 5, // optional (5 mins cache)
  });
};