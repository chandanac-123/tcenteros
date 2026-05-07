import { useMutation } from "@tanstack/react-query";
import { createNewPaymentOrder_Url, verifyPayment_Urls } from "./urls";

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
  return useMutation({
    mutationFn: verifyPayment_Urls,

    onSuccess: (data) => {
      console.log("Payment verified successfully:", data);
    },

    onError: (error) => {
      console.error("Payment verification failed:", error);
    },
  });
};