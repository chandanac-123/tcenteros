import { showError, showSuccess } from "@utils/toast";
import {
  addAccountDetails,
  deleteAccountDetails,
  getAccountDetails,
} from "./Urls";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useAccountDetailQuery = (data) => {
  return useQuery({
    queryKey: ["accountDetails", data],
    queryFn: () => getAccountDetails(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useAddAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => addAccountDetails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accountDetails"],
      });
      showSuccess("Account details added successfully");
    },
    onError: (err) => {
      showError(
        err?.response?.data?.detail || "Failed to create account details",
      );
      return err;
    },
  });
};

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAccountDetails(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accountDetails"],
      });
      showSuccess("Account details deleted successfully");
    },
    onError: (err) => {
      showError(
        err?.response?.data?.detail || "Failed to delete account details",
      );
      return err;
    },
  });
};
