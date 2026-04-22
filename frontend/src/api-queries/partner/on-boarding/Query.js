import { showError, showSuccess } from "@utils/toast";
import {
  createOnboardingDetails,
  createOnboardingPayment,
  getPaymentFee,
  getPaymentSuccess,
} from "./Urls";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const usePaymentFeeQuery = (data) => {
  return useQuery({
    queryKey: ["partnerOnboardingPaymentFee", data],
    queryFn: () => getPaymentFee(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};



export const usePaymentSuccessQuery = (id) => {
  return useQuery({
    queryKey: ["partnerOnboardingPaymentSuccess", id],
    queryFn: () => getPaymentSuccess(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateOnboardCenterMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: (data) => createOnboardingDetails(data),
    onSuccess: async (data) => {
      query.invalidateQueries("pricingPage");
      showSuccess("Onboard center created successfully");
    },
    onError: (err) => {
      console.log("err: ", err?.response);
      showError(
        err?.response?.data?.detail || "Failed to create onboard center",
      );
      return err;
    },
  });
};

export const useCreateOnboardingPaymentMutation = (id) => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: (details) => createOnboardingPayment(id, details),
    onSuccess: async () => {
      query.invalidateQueries(["partnerOnboardingPaymentSuccess", id]);
      showSuccess("Partner onboarding payment created successfully");
    },
    onError: (err) => {
      showError(
        err?.response?.data?.detail || "Failed to create onboarding payment",
      );
      return err;
    },
  });
};
