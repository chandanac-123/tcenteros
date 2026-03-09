import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCart, deleteCart, getAllCarts, updateCart } from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllCartQuery = data => {
  return useQuery({
    queryKey: ['cart', data],
    queryFn: () => getAllCarts(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
export const useCreateCartMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createCart(data),
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

// export const useSalaryGetByIdQuery = id => {
//   return useQuery({
//     queryKey: ['salary', id],
//     queryFn: () => getSalaryById(id),
//     enabled: !!id,
//     refetchOnWindowFocus: true,
//     refetchOnMount: true
//   })
// }
