import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {

  getNetwork,
} from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useNetworkQuery = (data) => {
  return useQuery({
    queryKey: ["network", data],
    queryFn: () => getNetwork(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};