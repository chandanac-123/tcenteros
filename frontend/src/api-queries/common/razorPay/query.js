import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewPaymentOrder_Url, verifyPayment_Urls } from "./urls";
import { showError, showSuccess } from "@utils/toast";
import { useAuthStore } from "@store/authStore";

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: createNewPaymentOrder_Url,
    onSuccess: (data) => {
    },
    onError: (error) => {
      console.error("Order creation failed:", error);
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: verifyPayment_Urls,
    onSuccess: async (data) => {
      setAuth(data?.data);
      console.log("Payment verified successfully:", data);
      // Refetch the branchCount query
      await queryClient.invalidateQueries({
        queryKey: ["branchCountData"],
      });
      showSuccess("Branch purchase successfully completed");
    },
    onError: (error) => {
      console.log("error: ", error);
      showError(
        error?.response?.data?.detail || "Payment verification failed:",
      );
    },
  });
};
