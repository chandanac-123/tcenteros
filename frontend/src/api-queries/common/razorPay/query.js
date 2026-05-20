import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewPaymentOrder_Url, verifyPayment_Urls } from "./urls";
import { showError } from "@utils/toast";

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: createNewPaymentOrder_Url,

    onSuccess: (data) => {
      // console.log("Order created:", data);
    },

    onError: (error) => {
      console.error("Order creation failed:", error);
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyPayment_Urls,
    onSuccess: async (data) => {
      console.log("Payment verified successfully:", data);
      // Refetch the branchCount query
      await queryClient.invalidateQueries({
        queryKey: ["branchCount"],
      });
      showSuccess("Branch purchase successfully completed");
    },
    onError: (error) => {
      console.log('error: ', error);
      showError(
        error?.response?.data?.detail || "Payment verification failed:",
      );
    },
  });
};
