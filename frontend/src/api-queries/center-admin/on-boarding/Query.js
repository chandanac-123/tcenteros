import { showError, showSuccess } from '@utils/toast'
import {
  getAllClassTypes,
  getAllPlatforms,
  createOnboardCenter,
  getPricingPage,
  calculateGst,
  finalizeOnboardCenter,
  getPlatformById,
  getInvoice,
  getAllResellers,
  getAllOnboardingCenters,
  razorpayFailure,
  retryRazorpayPayment
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
      showSuccess('Onboard center created successfully')
    },
    onError: err => {
      console.log('err: ', err?.response);
      // showError(err?.response?.data?.detail || 'Failed to create onboard center')
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
      showSuccess('Onboard center finalized successfully');
    },
    onError: err => {
      showError(err?.response?.data?.detail || 'Failed to finalize onboard center');
      return err;
    }
  });
};


export const useInvoiceQuery = id => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useAllResellersQuery = () => {
  return useQuery({
    queryKey: ['resellers'],
    queryFn: getAllResellers,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
export const useOnboardingCenters = () => {
  return useQuery({
    queryKey: ['onboarding-centers'],
    queryFn: getAllOnboardingCenters,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useRazorpayFailure = () => {
  return useMutation({
    mutationFn: (paymentOrderId) => razorpayFailure(paymentOrderId),
    // onSuccess: async data => {
    //   console.log('data: ', data);
    //   showError(data.message || 'Payment failed')
    // },
    // onError: err => {
    //   showError(err?.response?.data?.detail || 'Failed to report payment failure')
    //   return err
    // }
  });
};

export const useRetryPaymentMutation = () => {
  return useMutation({
    mutationFn: ({ onboardId, paymentId }) =>
      retryRazorpayPayment({ onboardId, paymentId }),
  });
};
