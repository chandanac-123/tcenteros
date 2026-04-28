import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardOverview } from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useDashboardOverviewQuery = () => {
  return useQuery({
    queryKey: ["dashbaordOverview"],
    queryFn: () => getDashboardOverview(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
