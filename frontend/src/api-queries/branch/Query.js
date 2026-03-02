import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createBranchCount } from "./Urls"

export const useAddBranchCountMutation = () => {
     const query = useQueryClient() 
    return useMutation({
        mutationFn: createBranchCount,
        onSuccess: () => {
            query.invalidateQueries({ queryKey: ['branchCount'] })
        }
    })
}
