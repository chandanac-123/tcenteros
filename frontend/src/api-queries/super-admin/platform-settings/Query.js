import { showError, showSuccess } from "@utils/toast";
import {
  createGlobalTermsAndPrivacy,
  getPlatformSettings,
  updatePlatformSettings,
} from "./Urls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateGlobalTermsAndPrivacyMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: (data) => createGlobalTermsAndPrivacy(data),
    onSuccess: async (data) => {
      query.invalidateQueries("globalTermsAndPrivacy");
      query.invalidateQueries("termsandprivacy");
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

export const useUpdatePlatformSettingsMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: (data) => updatePlatformSettings(data),
    onSuccess: async (data) => {
      query.invalidateQueries({ queryKey: ["platformSettings"] });
      showSuccess(data?.message || "Platform settings updated successfully");
    },
    onError: (err) => {
      showError(
        err?.response?.data?.detail || "Failed to update platform settings",
      );
      return err;
    },
  });
};

export const useGetPlatformSettingsQuery = () => {
  return useQuery({
    queryKey: ["platformSettings"],
    queryFn: () => getPlatformSettings(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
