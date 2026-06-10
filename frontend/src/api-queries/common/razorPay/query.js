import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewPaymentOrder_Url, verifyPayment_Urls } from "./urls";
import { showError, showSuccess } from "@utils/toast";
import { useAuthStore } from "@store/authStore";

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: createNewPaymentOrder_Url,
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: verifyPayment_Urls,
    onSuccess: async (data) => {
      setAuth(data?.data);
      // Refetch the branchCount query
      await queryClient.invalidateQueries({
        queryKey: ["branchCountData"],
      });
    },
    onError: (error) => {
      showError(
        error?.response?.data?.detail || "Payment verification failed:",
      );
    },
  });
};
