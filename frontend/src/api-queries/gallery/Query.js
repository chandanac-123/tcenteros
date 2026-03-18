import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createGallery,
  deleteGallery,
  getAllGallery,
} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useGalleryQuery = id => {
  return useQuery({
    queryKey: ['gallery', id],
    queryFn: () => getAllGallery(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateGalleryMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createGallery(data),
    onSuccess: async data => {
      query.invalidateQueries('gallery')
      showSuccess('Gallery created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create gallery')
      return err
    }
  })
}

export const useDeleteGalleryMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteGallery(id),
    onSuccess: async data => {
      query.invalidateQueries('gallery')
      showSuccess('Gallery deleted successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to delete gallery')
      return err
    }
  })
}
