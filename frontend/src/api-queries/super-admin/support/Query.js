import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignTicketById_Url, closeTicketById_Url, getSupportTicketById_Url, getSupportTickets_Url, openSupportTicket_Url, sendSupportMessage_Url } from "./Urls";
import { queryClient } from "@api/queryClient";
import { showError, showSuccess } from "@utils/toast";

export const useSupportTickets = () => {
    return useQuery({
        queryKey: ["support-tickets"],
        queryFn: getSupportTickets_Url,
    });
};

export const useSupportTicketById = (id) => {
    return useQuery({
        queryKey: ["support-ticket", id],
        queryFn: () => getSupportTicketById_Url(id),
        enabled: !!id,
        // refetchInterval: 3000,
    });
};

export const useOpenSupportTicket = () => {
    return useMutation({
        mutationFn: openSupportTicket_Url,
        onSuccess: () => {
            queryClient.invalidateQueries(["support-tickets"]);
            showSuccess("Ticket Opened...!")
        },
    });
};

export const useSendSupportMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => sendSupportMessage_Url({ id, data }),

        onSuccess: (_, variables) => {
            // refresh ticket after sending message
            queryClient.invalidateQueries([
                "support-ticket",
                variables.id,
            ]);
        },

        onError: (error) => {
            console.error("Message send failed:", error);
        },
    });
};


export const useCloseSupportTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: closeTicketById_Url,

        onSuccess: (_, variables) => {
            // refresh ticket list
            queryClient.invalidateQueries(["support-tickets"]);

            // refresh single ticket view
            queryClient.invalidateQueries([
                "support-ticket",
                variables.id,
            ]);
            showSuccess("Ticket Closed")
        },

        onError: (error) => {
            console.error("Error closing ticket:", error);
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                `Can't delete the platform feature`
            showError(message)
        },
    });
};


export const useAssignTicketMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assignTicketById_Url,

        onSuccess: (data, variables) => {
            // Optional: refetch tickets list
            queryClient.invalidateQueries({ queryKey: ["support-tickets"] });

            // Optional: refetch single ticket
            queryClient.invalidateQueries({
                queryKey: ["support-ticket", variables.ticket_id],
            });
            showSuccess("Ticket Assigned to center-Admin")
        },

        onError: (error) => {
            console.error("Assign ticket failed", error);
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                `Can't delete the platform feature`
            showError(message)
        },
    });
};