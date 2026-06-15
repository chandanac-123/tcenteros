import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addNetworkAmount,
  deleteNetworkBooking,
  editApproveStatusNetwork,
  getNetworkingBookingById,
  getNetworkToggleButton,
  getUserNetworkList,
  networkToggleButton,
  getNetworkAmount,
} from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useAddNetworkAmountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addNetworkAmount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
    },
  });
};

export const useNetworkToggleButtonMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: networkToggleButton,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
    },
  });
};

export const useGetNetworkToggleButtonQuery = () => {
  return useQuery({
    queryKey: ["network"],
    queryFn: getNetworkToggleButton,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useGetUserNetworkListQuery = (data) => {
  return useQuery({
    queryKey: ["network", data],
    queryFn: () => getUserNetworkList(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useEditApproveNetworkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => editApproveStatusNetwork(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
      queryClient.invalidateQueries({ queryKey: ["pendingNetwork"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
      showSuccess(
        data?.response?.data?.detail || "Network request approved successfully",
      );
    },
    onError: (error) => {
      showError(
        error?.response?.data?.detail || "Failed to update approval status",
      );
      return error;
    },
  });
};

export const useGetNetworkingBookingByIdQuery = (id) => {
  return useQuery({
    queryKey: ["network", id],
    queryFn: () => getNetworkingBookingById(id),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useDeleteNetworkBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteNetworkBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
    },
  });
};

export const useGetNetworkAmountQuery = (id) => {
  return useQuery({
    queryKey: ["network", id],
    queryFn: () => getNetworkAmount(id),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
