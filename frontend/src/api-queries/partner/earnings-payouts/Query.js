import { showError, showSuccess } from "@utils/toast";
import { getEarningsAndPayouts,exportEarningsAndPayouts } from "./Urls";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useEarningsAndPayoutsQuery = (data) => {
  return useQuery({
    queryKey: ["partnerEarningsAndPayouts", data],
    queryFn: () => getEarningsAndPayouts(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useExportEarningsAndPayoutsMutation = () => {
  return useMutation({
    mutationFn: () => exportEarningsAndPayouts()
  })
}