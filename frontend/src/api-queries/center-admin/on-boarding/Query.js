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
  retryRazorpayPayment,
  partnerRazorpayFailure,
  partnerRetryRazorpayPayment
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
export const useAllPlatformsQuery = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: getAllPlatforms,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateOnboardCenterMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createOnboardCenter(data),
    onSuccess: async data => {
      query.invalidateQueries('pricingPage')
      showSuccess('Onboard center created successfully')
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
  });
};

export const useRetryPaymentMutation = () => {
  return useMutation({
    mutationFn: ({ onboardId, paymentId }) =>
      retryRazorpayPayment({ onboardId, paymentId }),
  });
};

export const usePartnerRazorpayFailure = () => {
  return useMutation({
    mutationFn: (paymentOrderId) => partnerRazorpayFailure(paymentOrderId),
  });
};

export const usePartnerRetryPaymentMutation = () => {
  return useMutation({
    mutationFn: (paymentId) =>
      partnerRetryRazorpayPayment(paymentId),
  });
};