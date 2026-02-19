import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createHoliday, deleteHoliday, getAllHoliday } from './Urls'

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
    },
    onError: err => {
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
    },
    onError: err => {
      return err
    }
  })
}

