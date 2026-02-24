import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWalletAmountApiCall } from "./Urls";

export const useCreateWalletAmountMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWalletAmountApiCall,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
        }
    });
}
