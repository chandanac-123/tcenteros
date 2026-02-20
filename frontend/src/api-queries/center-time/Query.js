import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCenterTime, deleteCenterTime, getAllCenterTime, updateCenterTime } from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllCenterTimeQuery = () => {
  return useQuery({
    queryKey: ['centerTime'],
    queryFn: getAllCenterTime,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
export const useCreateCenterTimeMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createCenterTime(data),
    onSuccess: async data => {
      query.invalidateQueries('centerTime')
       showSuccess('Center time created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create center time')
      return err
    }
  })
}

export const useUpdateCenterTimeMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateCenterTime(data, id),
    onSuccess: async data => {
      query.invalidateQueries('centerTime')
      showSuccess('Center time updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to update center time')
      return err
    }
  })
}

export const useDeleteCenterTimeMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteCenterTime(id),
    onSuccess: async data => {
      query.invalidateQueries('centerTime')
      showSuccess('Center time deleted successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to delete center time')
      return err
    }
  })
}
