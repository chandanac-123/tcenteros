import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBranchPrice, getBranch } from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useBranchQuery = (data) => {
  return useQuery({
    queryKey: ["branch", data],
    queryFn: () => getBranch(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateBranchPriceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createBranchPrice(data),
    onSuccess: (data) => {
      showSuccess(data?.detail || "Branch price created successfully");
      queryClient.invalidateQueries({ queryKey: ["branch"] });
    },
    onError: (error) => {
      showError(
        error?.response?.data?.detail || "Failed to create branch price",
      );
    },
  });
};
