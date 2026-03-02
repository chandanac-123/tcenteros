import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { updateProfile, getProfile, getProfileById } from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useUpdateProfileMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => updateProfile(data),
    onSuccess: async data => {
      query.invalidateQueries('profile')
      showSuccess('Profile updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to update profile')
      return err
    }
  })
}

export const useGetProfileByIdQuery = id => {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfileById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
