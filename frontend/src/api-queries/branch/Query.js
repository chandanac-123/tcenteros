import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    createBranchCount,
    createNewBranch,
    getBranchCategoriesList,
    getBranchCount,
    getBranchPricesAndTax,
    getPurchasedBranches
} from "./Urls"

export const useAddBranchCountMutation = () => {
    const query = useQueryClient()
    return useMutation({
        mutationFn: createBranchCount,
        onSuccess: () => {
            query.invalidateQueries({ queryKey: ['branchCount'] })
        }
    })
}

export const useGetBranchPricesAndTaxQuery = () => {
    return useQuery({
        queryKey: ['branchPricesAndTax'],
        queryFn: getBranchPricesAndTax,
        onSuccess: (data) => {
            console.log("Branch Prices and Tax data fetched successfully:", data);
        }
    })
}

export const useGetPurchasedBranchesQuery = () => {
    return useQuery({
        queryKey: ['purchasedBranches'],
        queryFn: getPurchasedBranches,
        onSuccess: (data) => {
            console.log("Purchased Branches data fetched successfully:", data);
        }
    })
}

export const useGetBranchCategoriesListQuery = () => {
    return useQuery({
        queryKey: ['branchCategoriesList'],
        queryFn: getBranchCategoriesList,
        onSuccess: (data) => {
            console.log("Branch Categories List data fetched successfully:", data);
        },
        onError: (error) => {
            console.error("Error fetching Branch Categories List:", error);
        }
    })
}

export const useCreateNewBranchMutation = () => {
    const query = useQueryClient()
    return useMutation({
        mutationFn: async (payload) => {
            console.log("🔥 Mutation Payload:", payload);
            return await createNewBranch(payload);
        },
        onSuccess: () => {
            query.invalidateQueries({ queryKey: ['branchCount'] })
        },
        onError: (error) => {
             showError(error?.response?.data?.detail || 'Failed to create branch')
        }
    })
}



export const useGetBranchCountQuery = () => {
  return useQuery({
    queryKey: ['branchCount'],
    queryFn: getBranchCount,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}