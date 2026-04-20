import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSlot, deleteSlot, getAllSlot } from './Urls'
import { showError, showSuccess } from '@utils/toast'

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
      showSuccess('Slot created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create slot')
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
      showSuccess('Slot deleted successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to delete slot')
      return err
    }
  })
}

