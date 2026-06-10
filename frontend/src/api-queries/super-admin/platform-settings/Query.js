import { showError, showSuccess } from "@utils/toast";
import {
  createCenterType,
  createGlobalTermsAndPrivacy,
  createNewFAQs,
  deleteCenterType,
  deleteFAQ,
  getCenterType,
  getPlatformSettings,
  listAllFAQs,
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

export const useGetCenterTypeQuery = () => {
  return useQuery({
    queryKey: ["centerType"],
    queryFn: () => getCenterType(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateCenterTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createCenterType(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["centerType"] });
      showSuccess(data?.message || "Center type created successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.detail || "Failed to create center type");
      return err;
    },
  });
};

export const useDeleteCenterTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCenterType(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["centerType"] });
      showSuccess(data?.message || "Center type deleted successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.detail || "Failed to delete center type");
      return err;
    },
  });
};


export const useCreateFAQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createNewFAQs(data),
    onSuccess: (data) => {
      showSuccess(data?.message || "Successfully added FAQs...!")
      //  Refetch FAQ list (important)
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
    onError: (error) => {
      showError("Error at adding FAQs")
    },
  });
};


export const useFAQs = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: listAllFAQs,
    staleTime: 1000 * 60 * 5, // cache for 5 mins
    retry: 2,
  });
};

export const useDeleteFAQMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteFAQ(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      showSuccess(data?.message || "FAQ deleted successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.detail || "Failed to delete FAQ");
      return err;
    },
  });
};