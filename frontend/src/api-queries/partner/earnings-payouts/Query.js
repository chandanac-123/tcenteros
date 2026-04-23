import { showError, showSuccess } from "@utils/toast";
import { getEarningsAndPayouts,exportEarningsAndPayouts } from "./Urls";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { downloadFile } from "@utils/helper";

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
    mutationFn: () => exportEarningsAndPayouts(),
    onSuccess: (data) => {
      downloadFile(data, "earnings-and-payouts.pdf");
    },
    onError: (err) => {
      showError(
        err?.response?.data?.detail || "Failed to export earnings and payouts",
      );
      return err;
    },
  })
}