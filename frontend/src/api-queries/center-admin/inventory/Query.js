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
  createStockEntry,
  getInventoryProfit,
  getStockReport,
  getInventoryReport,
  getPurchaseReport,
  getSaleReport,
  getGenerateSaleReport,
  getGeneratePurchaseReport,
  getGenerateInventoryReport,
  getGenerateStockReport,
  getDashboardData,
  getDropdownProducts,
  getInventoryProfitValue,
  createInventoryProfit
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
      showError(err?.response?.data?.detail || 'Failed to create product')
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
      showError(err?.response?.data?.detail || 'Failed to update product')
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
      showSuccess('Product deleted successfully')
    },
    onError: err => {
      console.error(err)
      showError(err?.response?.data?.detail || 'Failed to delete product')
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
      showError(err?.response?.data?.detail || 'Failed to create SKU')
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
      showError(err?.response?.data?.detail || 'Failed to delete SKU')
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
      showError(err?.response?.data?.detail || 'Failed to create stock entry')
      return err
    }
  })
}

export const useInventoryProfitQuery = () => {
  return useQuery({
    queryKey: ['inventory-profit'],
    queryFn: () => getInventoryProfit(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useProductDropdownQuery = () => {
  return useQuery({
    queryKey: ['Product'],
    queryFn: () => getDropdownProducts(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useSalesReportQuery = params => {
  return useQuery({
    queryKey: ['sales-report', params],
    queryFn: () => getSaleReport(params),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const usePurchaseReportQuery = params => {
  return useQuery({
    queryKey: ['purchase-report', params],
    queryFn: () => getPurchaseReport(params),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useInventoryReportQuery = params => {
  return useQuery({
    queryKey: ['inventory-report', params],
    queryFn: () => getInventoryReport(params),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useStockReportQuery = params => {
  return useQuery({
    queryKey: ['stock-report', params],
    queryFn: () => getStockReport(params),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useGenerateSaleReportMutation = () => {
  return useMutation({
    mutationFn: data => getGenerateSaleReport(data)
  })
}

export const useGeneratePurchaseReportMutation = () => {
  return useMutation({
    mutationFn: data => getGeneratePurchaseReport(data)
  })
}

export const useGenerateInventoryReportMutation = () => {
  return useMutation({
    mutationFn: data => getGenerateInventoryReport(data)
  })
}

export const useGenerateStockReportMutation = () => {
  return useMutation({
    mutationFn: data => getGenerateStockReport(data)
  })
}


export const useInventoryDashboardQuery = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useInventoryProfitValueQuery = () => {
  return useQuery({
    queryKey: ['inventory-profit-value'],
    queryFn: () => getInventoryProfitValue(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateInventoryProfitMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createInventoryProfit(data),
    onSuccess: async data => {
      query.invalidateQueries('inventory-profit-value')
      showSuccess('Inventory profit created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.detail || 'Failed to create inventory profit')
      return err
    }
  })
}