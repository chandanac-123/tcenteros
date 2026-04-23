import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeLeadStatus_Url, createNewLeads_Urls, getAllLeads_Url } from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useAllLeads = (params) => {
    return useQuery({
        queryKey: ["all-leads", params],
        queryFn: () => getAllLeads_Url(params),
        keepPreviousData: true, // useful for pagination
    });
};

export const useCreateLead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createNewLeads_Urls,

        onSuccess: () => {
            // 🔄 Refetch leads list after creating
            queryClient.invalidateQueries({ queryKey: ["all-leads"] });
            showSuccess("New Lead is created")
        },
        onError: (error) => {
            console.log("Create Lead Error:", error);
        },
    });
};

export const useChangeLeadStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: changeLeadStatus_Url,

        onSuccess: () => {
            // 🔥 Refetch leads list after status update
            queryClient.invalidateQueries(["all-leads"]);
            showSuccess("Status changed successfully")
        },

        onError: (err) => {
            console.error("Error updating lead status:", err);
            showError("Oops...something went wrong !")
        }
    });
};