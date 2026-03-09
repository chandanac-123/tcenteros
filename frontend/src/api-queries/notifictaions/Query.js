import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllTickets } from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllTicketsQuery = () => {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: getAllTickets,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
