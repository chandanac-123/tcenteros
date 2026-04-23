import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDashboardData ,getRenewSubscriptionData} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useRenewSubscriptionQuery = () => {
  return useQuery({
    queryKey: ['renewSubscription'],
    queryFn: getRenewSubscriptionData,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}