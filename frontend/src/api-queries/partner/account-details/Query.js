import { showError, showSuccess } from "@utils/toast";
import {
  addAccountDetails,
  getAccountDetails,
} from "./Urls";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useAccountDetailQuery = (data) => {
  return useQuery({
    queryKey: ["accountetails", data],
    queryFn: () => getAccountDetails(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useAddAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => addAccountDetails(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["accountetails"],
      });
    },
    onError: (err) => {
      showError(
        err?.response?.data?.detail || "Failed to create account details",
      );
      return err;
    },
  });
};
