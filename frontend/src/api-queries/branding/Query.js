import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBrand,
  createTermsandPrivacy,
  getBrand,
  getTermsandPrivacy
} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllBrandQuery = () => {
  return useQuery({
    queryKey: ['brand'],
    queryFn: getBrand,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateBrandMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createBrand(data),
    onSuccess: async data => {
      query.invalidateQueries('brand')
      showSuccess('Brand created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create brand')
      return err
    }
  })
}

export const useAllTermsandPrivacyQuery = () => {
  return useQuery({
    queryKey: ['termsandprivacy'],
    queryFn: getTermsandPrivacy,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateTermsandPrivacyMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createTermsandPrivacy(data),
    onSuccess: async data => {
      query.invalidateQueries('termsandprivacy')
      showSuccess('Terms and Privacy created successfully')
    },
    onError: err => {
      showError(
        err?.response?.data?.message || 'Failed to create terms and privacy'
      )
      return err
    }
  })
}
