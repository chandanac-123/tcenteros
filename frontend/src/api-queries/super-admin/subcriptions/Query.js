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