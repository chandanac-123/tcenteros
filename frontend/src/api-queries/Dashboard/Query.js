import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDashboardData } from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

