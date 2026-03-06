import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getAllSKU,
  updateProduct,


} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllSKUsQuery = () => {
  return useQuery({
    queryKey: ['sku'],
    queryFn: () => getAllSKU(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateProductMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createProduct(data),
    onSuccess: async data => {
      query.invalidateQueries('Product')
      showSuccess('Product created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create product')
      return err
    }
  })
}

export const useUpdateProductMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(data, id),
    onSuccess: async data => {
      query.invalidateQueries('Product')
      showSuccess('Product updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to update product')
      return err
    }
  })
}

export const useDeleteProductMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteProduct(id),
    onSuccess: async data => {
      query.invalidateQueries('Product')
    },
    onError: err => {
      return err
    }
  })
}

export const useAllProductsQuery = (data) => {
  return useQuery({
    queryKey: ['Product'],
    queryFn: () => getAllProducts(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
