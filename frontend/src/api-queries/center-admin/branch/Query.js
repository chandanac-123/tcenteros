import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBranchCount,
  createNewBranch,
  getBranchCategoriesList,
  getBranchCount,
  getBranchPricesAndTax,
  getPurchasedBranches,
} from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useAddBranchCountMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: createBranchCount,
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["addBranchCount"] });
    }
  });
};

export const useGetBranchPricesAndTaxQuery = () => {
  return useQuery({
    queryKey: ["branchPricesAndTax"],
    queryFn: () => getBranchPricesAndTax(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useGetPurchasedBranchesQuery = () => {
  return useQuery({
    queryKey: ["purchasedBranches"],
    queryFn: getPurchasedBranches,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useGetBranchCategoriesListQuery = () => {
  return useQuery({
    queryKey: ["branchCategoriesList"],
    queryFn: getBranchCategoriesList,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateNewBranchMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createNewBranch(data),
    onSuccess: async data => {
     query.invalidateQueries({ queryKey: ["branchCountData"] });
     query.invalidateQueries({ queryKey: ["dashboard"] });
       showSuccess("Branch created successfully");
    },
    onError: error => {
       showError(error?.response?.data?.detail || "Failed to create branch");
      return error
    }
  })
}

export const useGetBranchCountQuery = () => {
  return useQuery({
    queryKey: ["branchCountData"],
    queryFn: getBranchCount,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
