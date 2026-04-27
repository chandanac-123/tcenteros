import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateSuperadminProfile, getSuperadminProfile } from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useSuperadminProfileQuery = () => {
  return useQuery({
    queryKey: ["superadminProfile"],
    queryFn: () => getSuperadminProfile(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useUpdateSuperadminProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateSuperadminProfile(data),
    onSuccess: (data) => {
      showSuccess(data?.message || "Superadmin profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["superadminProfile"] });
    },
    onError: (error) => {
      showError(
        error?.response?.data?.message || "Failed to update superadmin profile",
      );
    },
  });
};
