import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlatformFeatuer_Url, deletePlatformFeature_Url, getPlatformFeature_Url, getPlatformFeatureById_Url, updatePlatformFeature_Url } from "./Urls";
import { showError, showSuccess } from "@utils/toast";

;

export const useCreatePlatformFeature = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPlatformFeatuer_Url,

        onSuccess: () => {
            queryClient.invalidateQueries(["platform-features"]);
            showSuccess('Platform feature created successfully')
        },

        onError: (error) => {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                `Can't create platform feature`
            showError(message)
        },
    });
};


export const usePlatformFeatureById = (id) => {
    return useQuery({
        queryKey: ["platform-feature", id],
        queryFn: () => getPlatformFeatureById_Url(id),
        enabled: !!id,
    });
};

export const useUpdatePlatformFeature = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePlatformFeature_Url,

        onSuccess: () => {
            queryClient.invalidateQueries(["platform-features"]);
            showSuccess('Platform feature updated successfully')
        },
        onError: (error) => {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                `Can't update the platform feature`
            showError(message)
        },
    });
};


export const useDeletePlatformFeature = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePlatformFeature_Url,

        onSuccess: () => {
            queryClient.invalidateQueries(["platform-features"]);
            showSuccess('Platform feature deleted successfully')
        },
        onError: (error) => {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                `Can't delete the platform feature`
            showError(message)
        },
    });
};

export const usePlatformFeatures = () => {
    return useQuery({
        queryKey: ["platform-features"],
        queryFn: getPlatformFeature_Url,
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });
};