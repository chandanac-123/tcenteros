import {  useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "./Urls";

export const useDashboardOverviewQuery = () => {
  return useQuery({
    queryKey: ["superadmin-dashboard"],
    queryFn: () => getDashboardOverview(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
