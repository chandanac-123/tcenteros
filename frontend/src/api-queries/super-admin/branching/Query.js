import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {

  getBranch,
} from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useBranchQuery = (data) => {
  return useQuery({
    queryKey: ["branch", data],
    queryFn: () => getBranch(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};