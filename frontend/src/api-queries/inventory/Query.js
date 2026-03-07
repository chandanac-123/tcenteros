import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  createSKU,
  deleteProduct,
  deleteSKU,
  getAllProducts,
  getAllSKU,
  updateProduct,
  getAllStock,
  getAllStockTransactions,
  createStockEntry
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: id => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Product'] })
    },
    onError: err => {
      console.error(err)
    }
  })
}

export const useAllProductsQuery = data => {
  return useQuery({
    queryKey: ['Product'],
    queryFn: () => getAllProducts(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateSKUMutation = data => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createSKU(data),
    onSuccess: async data => {
      query.invalidateQueries('sku')
      showSuccess('SKU created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create SKU')
      return err
    }
  })
}

export const useDeleteSKUMutation = id => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteSKU(id),
    onSuccess: async data => {
      query.invalidateQueries('sku ')
      showSuccess('SKU deleted successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to delete SKU')
      return err
    }
  })
}

export const useAllStockQuery = data => {
  return useQuery({
    queryKey: ['stock'],
    queryFn: () => getAllStock(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useAllStockTransactionsQuery = data => {
  return useQuery({
    queryKey: ['stock'],
    queryFn: () => getAllStockTransactions(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateStockEntryMutation = data => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createStockEntry(data),
    onSuccess: async data => {
      query.invalidateQueries('stock')
      showSuccess('Stock entry created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create stock entry')
      return err
    }
  })
}
