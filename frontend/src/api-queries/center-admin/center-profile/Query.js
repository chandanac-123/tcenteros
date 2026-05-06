import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  updateProfile,
  getProfile,
  getProfileById,
  updateProfilePic,
  updateProfileImage,
  getProfileInfo,
  fetchCenterLocation,
  fetchAllCenters,
  getCenterLocation
} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useUpdateProfileMutation = (id, data) => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => updateProfile(data,id),
    onSuccess: async data => {
      query.invalidateQueries('profile')
      showSuccess('Profile updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.detail || 'Failed to update profile')
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

export const useUpdateProfilePicMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => updateProfilePic(data),
    onSuccess: async data => {
      query.invalidateQueries('profile')
      showSuccess('Profile picture updated successfully')
    },
    onError: err => {
      showError(
        err?.response?.data?.detail || 'Failed to update profile picture'
      )
      return err
    }
  })
}

export const useUpdateProfileImageMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => updateProfileImage(data),
    onSuccess: async data => {
      query.invalidateQueries('profile')
      showSuccess('Center image updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.detail || 'Failed to update center image')
      return err
    }
  })
}

export const useGetProfileInfoQuery = () => {
  return useQuery({
    queryKey: ['profileInfo'],
    queryFn: getProfileInfo,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useFetchCenterLocationMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => fetchCenterLocation(data),
    onSuccess: async data => {
      query.invalidateQueries('profile')
      showSuccess('Center location fetched successfully')
    },
    onError: err => {
      showError(err?.response?.data?.detail || 'Failed to fetch center location')
      return err
    }
  })
}

export const useAllCentersQuery = () => {
  return useQuery({
    queryKey: ['centers'],
    queryFn: fetchAllCenters,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useGetCenterLocationQuery = id => {
  return useQuery({
    queryKey: ['centerLocation', id],
    queryFn: () => getCenterLocation(id),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}