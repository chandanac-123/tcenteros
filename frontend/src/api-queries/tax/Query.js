import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTax, deleteTax, getAllTax, getTaxById, updateTax } from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllTaxQuery = () => {
  return useQuery({
    queryKey: ['tax'],
    queryFn: getAllTax,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
export const useCreateTaxMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createTax(data),
    onSuccess: async data => {
      query.invalidateQueries('tax')
      showSuccess('Tax created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create tax')
      return err
    }
  })
}

export const useUpdateTaxMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateTax(data, id),
    onSuccess: async data => {
      query.invalidateQueries('tax')
      showSuccess('Tax updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to update tax')
      return err
    }
  })
}

export const useDeleteTaxMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteTax(id),
    onSuccess: async data => {
      query.invalidateQueries('tax')
    },
    onError: err => {
      return err
    }
  })
}

export const useTaxGetByIdQuery = id => {
  return useQuery({
    queryKey: ['tax', id],
    queryFn: () => getTaxById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
