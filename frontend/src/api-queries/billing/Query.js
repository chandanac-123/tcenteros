import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCart,
  deleteCart,
  updateCart,
  cartOpen,
  getCartAmount,
  checkoutCart,
  getSales,
  getSaleById,
  getAllSales,
  getAllSaleById
} from './Urls'
import { showError, showSuccess } from '@utils/toast'
import { useCartStore } from '@store/cartStore'

export const useSalesQuery = data => {
  return useQuery({
    queryKey: ['cart', data],
    queryFn: () => getSales(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateCartMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ details, id }) => createCart(details, id),
    onSuccess: async data => {
      query.invalidateQueries('cart')
      showSuccess('Cart created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create cart')
      return err
    }
  })
}

export const useUpdateCartMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateCart(data, id),
    onSuccess: async data => {
      query.invalidateQueries('cart')
      showSuccess('Cart updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to update cart')
      return err
    }
  })
}

export const useDeleteCartMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteCart(id),
    onSuccess: async data => {
      query.invalidateQueries('cart')
      showSuccess(data.detail || 'Cart deleted successfully')
    },
    onError: err => {
      showError(
        err?.response?.data?.message || 'Failed to delete selected carts'
      )
      return err
    }
  })
}

export const useCartOpenMutation = () => {
  const query = useQueryClient()
  const setOpenedCartResponse = useCartStore(
    state => state.setOpenedCartResponse
  )
  return useMutation({
    mutationFn: () => cartOpen(),
    onSuccess: async data => {
      query.invalidateQueries('cart')
      setOpenedCartResponse(data)
      showSuccess('Cart opened successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to open cart')
      return err
    }
  })
}

export const useCartAmountQuery = data => {
  return useQuery({
    queryKey: ['cart', data],
    queryFn: () => getCartAmount(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCheckoutCartMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => checkoutCart(data),
    onSuccess: async data => {
      query.invalidateQueries('cart')
      showSuccess('Cart checked out successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to checkout cart')
      return err
    }
  })
}

export const useGetSaleByIdQuery = id => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => getSaleById(id),
    enabled: Boolean(id)
  })
}

export const useGetAllSalesQuery = data => {
  return useQuery({
    queryKey: ['allSales', data],
    queryFn: () => getAllSales(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useGetAllSaleByIdQuery = id => {
  return useQuery({
    queryKey: ['allSale', id],
    queryFn: () => getAllSaleById(id),
    enabled: Boolean(id)
  })
}