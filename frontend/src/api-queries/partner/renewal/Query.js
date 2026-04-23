import { showError, showSuccess } from "@utils/toast";
import { getRenewals,exportEarningsAndPayouts } from "./Urls";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { downloadFile } from "@utils/helper";

export const useRenewalsQuery = (data) => {
  return useQuery({
    queryKey: ["partnerRenewals", data],
    queryFn: () => getRenewals(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useExportRenewalsMutation = () => {
  return useMutation({
    mutationFn: () => exportEarningsAndPayouts(),
    onSuccess: (data) => {
      downloadFile(data, "renewals.pdf");
    },
    onError: (err) => {
      showError(
        err?.response?.data?.detail || "Failed to export renewals",
      );
      return err;
    },
  })
}