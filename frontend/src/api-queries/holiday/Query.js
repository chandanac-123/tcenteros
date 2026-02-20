import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createHoliday, deleteHoliday, getAllHoliday } from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllHolidayQuery = () => {
  return useQuery({
    queryKey: ['holiday'],
    queryFn: getAllHoliday,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
export const usecreateHolidayMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createHoliday(data),
    onSuccess: async data => {
      query.invalidateQueries('holiday')
      showSuccess('Holiday created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create holiday')
      return err
    }
  })
}

export const usedeleteHolidayMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteHoliday(id),
    onSuccess: async data => {
      query.invalidateQueries('holiday')
      showSuccess('Holiday deleted successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to delete holiday')
      return err
    }
  })
}

