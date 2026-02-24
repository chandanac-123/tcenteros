import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    addNetworkAmount,
    deleteNetworkBooking,
    editApproveStatusNetwork,
    getNetworkingBookingById,
    getNetworkToggleButton,
    getUserNetworkList,
    networkToggleButton
} from "./Urls"

export const useAddNetworkAmountMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: addNetworkAmount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['network'] })
        }
    })
}

export const useNetworkToggleButtonMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: networkToggleButton,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['network'] })
        }
    })
}

export const useGetNetworkToggleButtonQuery = () => {
    return useQuery({
        queryKey: ['network'],
        queryFn: getNetworkToggleButton,
        refetchOnWindowFocus: true,
        refetchOnMount: true
    })
}

export const useGetUserNetworkListQuery = (data) => {
    return useQuery({
        queryKey: ['network', data],
        queryFn: () => getUserNetworkList(data),
        refetchOnWindowFocus: true,
        refetchOnMount: true
    })
}   

export const useEditApproveNetworkMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
       mutationFn: ( id) => editApproveStatusNetwork( id),
        onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: ['network'] });
        }
    });
}      

export const useGetNetworkingBookingByIdQuery = (id) => {
    return useQuery({
        queryKey: ['network', id],
        queryFn: () => getNetworkingBookingById(id),
        refetchOnWindowFocus: true,
        refetchOnMount: true
    })
}   

export const useDeleteNetworkBookingMutation = () => {
    const queryClient = useQueryClient(); 
    return useMutation({
        mutationFn: (id) => deleteNetworkBooking(id),
        onSuccess: () => {  
            queryClient.invalidateQueries({ queryKey: ['network'] });
        }   
    });
}