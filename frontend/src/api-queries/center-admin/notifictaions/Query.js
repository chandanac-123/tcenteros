import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllTickets,
  getAllPendingNetwork,
  getTicketById,
  sendMessage,
  closeMessage,
  getTimeSlot,
  approveTimeSlot,
  getCenterReminders,
  getNotificationCount
} from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useAllTicketsQuery = () => {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: getAllTickets,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useTicketByIdQuery = (id) => {
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: () => getTicketById(id),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useSendMessageMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: ({ data, id }) => sendMessage(data, id),
    onSuccess: () => {
      query.invalidateQueries(["tickets"]);
    },
    onError: (err) => {
      showError(err?.response?.data?.message || "Failed to send message");
      return err;
    },
  });
};

export const useCloseMessageMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: ({ data, id }) => closeMessage(data, id),
    onSuccess: () => {
      query.invalidateQueries(["tickets"]);
      query.invalidateQueries(["notificationCount"]);
      showSuccess("Chat closed successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.message || "Failed to close chat message");
      return err;
    },
  });
};

export const useAllPendingNetworkQuery = () => {
  return useQuery({
    queryKey: ["pendingNetwork"],
    queryFn: getAllPendingNetwork,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useTimeSlotQuery = () => {
  return useQuery({
    queryKey: ["timeSlot"],
    queryFn: getTimeSlot,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useApproveTimeSlotMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: ({ data, id }) => approveTimeSlot(data, id),
    onSuccess: () => {
      query.invalidateQueries(["timeSlot"]);
      query.invalidateQueries(["notificationCount"]);
      showSuccess("Time slot approved successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.message || "Failed to approve time slot");
      return err;
    },
  });
};

export const useCenterRemindersQuery = () => {
  return useQuery({
    queryKey: ["centerReminders"],
    queryFn: getCenterReminders,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useNotificationCountQuery = () => {
  return useQuery({
    queryKey: ["notificationCount"],
    queryFn: getNotificationCount,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};