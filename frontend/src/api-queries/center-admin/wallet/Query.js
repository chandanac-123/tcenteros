import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createWalletAmountApiCall,
    getWalletAmount,
    getWalletSummary,
    getWalletTransactions
} from "./Urls";

// :::: CREATE WALLET AMOUNT :::: //
export const useCreateWalletAmountMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createWalletAmountApiCall,
        onSuccess: () => {
            // Invalidate all wallet-related queries
            queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
            queryClient.invalidateQueries({ queryKey: ['walletAmount'] });
            queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
        }
    });
};


// :::: GET WALLET SUMMARY ::::/
export const useGetWalletSummaryQuery = () => {
    return useQuery({
        queryKey: ['walletSummary'],
        queryFn: getWalletSummary,
        refetchOnWindowFocus: true,
        refetchOnMount: true
    });
};

// :::: GET WALLET TRANSACTIONS (with params) :::: //
export const useGetWalletTransactionsQuery = (details) => {
    return useQuery({
        queryKey: ['walletTransactions', details],
        queryFn: () => getWalletTransactions(details),
        enabled: !!details, // prevents query from running if details is undefined
    });
};

// ::::: GET WALLET AMOUNT :::: //
export const useGetWalletAmountQuery = () => {
    return useQuery({
        queryKey: ['walletAmount'],
        queryFn: getWalletAmount,
    });
};