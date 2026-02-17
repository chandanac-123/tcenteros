import {
  getAllClassTypes,
  getAllPlatforms,
  createOnboardCenter,
  getPricingPage,
  calculateGst,
  finalizeOnboardCenter,
  getPlatformById
} from './Urls'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useAllClassTypesQuery = () => {
  return useQuery({
    queryKey: ['classtypes'],
    queryFn: getAllClassTypes,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const usePlatformByIdQuery = (id) => {
  return useQuery({
    queryKey: ['platforms', id],
    queryFn: () => getPlatformById(id),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

// export const useAllClassTypesQuery = (data) => {
//     console.log('aaaaaaaaaa: ', data);
//   return useQuery({
//     queryKey: ['classtypes', data],
//     queryFn: () => getAllClassTypes(data),
//     refetchOnWindowFocus: true,
//     refetchOnMount: true,
//   });
// };

export const useAllPlatformsQuery = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: getAllPlatforms,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

// export const useCreateOnboardCenterMutation = () => {
//   return useMutation({
//     mutationFn: createOnboardCenter,
//   });
// };

export const useCreateOnboardCenterMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createOnboardCenter(data),
    onSuccess: async data => {
      query.invalidateQueries('pricingPage')
    },
    onError: err => {
      return err
    }
  })
}

export const usePricingPageQuery = id => {
  return useQuery({
    queryKey: ['pricingPage', id],
    queryFn: () => getPricingPage(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCalculateGstQuery = id => {
  return useQuery({
    queryKey: ['calculateGst', id],
    queryFn: () => calculateGst(id),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useFinalizeOnboardCenterMutation = (id) => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: (details) => finalizeOnboardCenter(details, id),
    onSuccess: async data => {
      query.invalidateQueries('invoiceSummary');
    },
    onError: err => {
      return err;
    }
  });
};
