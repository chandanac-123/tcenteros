import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSlot, deleteSlot, getAllSlot } from './Urls'

export const useAllSlotQuery = () => {
  return useQuery({
    queryKey: ['slot'],
    queryFn: getAllSlot,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
export const useCreateSlotMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createSlot(data),
    onSuccess: async data => {
      query.invalidateQueries('slot')
    },
    onError: err => {
      return err
    }
  })
}

export const useDeleteSlotMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteSlot(id),
    onSuccess: async data => {
      query.invalidateQueries('slot')
    },
    onError: err => {
      return err
    }
  })
}

