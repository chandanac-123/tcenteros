import { showError, showSuccess } from "@utils/toast";
import { createGlobalTermsAndPrivacy } from "./Urls";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateGlobalTermsAndPrivacyMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: (data) => createGlobalTermsAndPrivacy(data),
    onSuccess: async (data) => {
      query.invalidateQueries("globalTermsAndPrivacy");
      query.invalidateQueries('termsandprivacy');
      showSuccess("Global Terms and Privacy created successfully");
    },
    onError: (err) => {
      showError(
        err?.response?.data?.detail ||
          "Failed to create Global Terms and Privacy",
      );
      return err;
    },
  });
};
