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
  getAllSaleById,
  getMembershipById,
  getAllMemberships,
  getNetworkById,
  getOutgoingNetwork,
  getIncomingNetwork,
  getRenewMembershipById,
  renewMembership,
  getSaleReport,
  getMembershipReport,
  getNetworkReport,
  generateSettlementReport,
  getSettlementById,
  completeSettlement,
  getSettlements,
  addCharge,
  generateSaleReport,
  generateMembershipReport,
  generateNetworkReport,
  getSettlementReport
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

export const useGetAllMembershipsQuery = data => {
  return useQuery({
    queryKey: ['membership', data],
    queryFn: () => getAllMemberships(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useGetMembershipByIdQuery = id => {
  return useQuery({
    queryKey: ['membership', id],
    queryFn: () => getMembershipById(id),
    enabled: Boolean(id)
  })
}

export const useRenewMembershipMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ data, id }) => renewMembership(data, id),
    onSuccess: () => {
      query.invalidateQueries(['membership'])
      showSuccess('Membership renewed successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to renew membership')
      return err
    }
  })
}

export const useGetRenewMembershipByIdQuery = id => {
  return useQuery({
    queryKey: ['renewMembership', id],
    queryFn: () => getRenewMembershipById(id),
    enabled: Boolean(id)
  })
}

export const useIncomingNetworkQuery = data => {
  return useQuery({
    queryKey: ['incomingNetwork', data],
    queryFn: () => getIncomingNetwork(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useOutgoingNetworkQuery = data => {
  return useQuery({
    queryKey: ['outgoingNetwork', data],
    queryFn: () => getOutgoingNetwork(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useGetNetworkByIdQuery = id => {
  return useQuery({
    queryKey: ['network', id],
    queryFn: () => getNetworkById(id),
    enabled: Boolean(id)
  })
}

export const useSettlementsQuery = data => {
  return useQuery({
    queryKey: ['settlements', data],
    queryFn: () => getSettlements(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useSettlementByIdQuery = id => {
  return useQuery({
    queryKey: ['settlement', id],
    queryFn: () => getSettlementById(id),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: id ? true : false
  })
}

export const useCompleteSettlementMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => completeSettlement(id, data),
    onSuccess: () => {
      query.invalidateQueries(['settlements'])
      showSuccess('Settlement completed successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to complete settlement')
      return err
    }
  })
}

//REPORTS

export const useSaleReportQuery = data => {
  return useQuery({
    queryKey: ['saleReport', data],
    queryFn: () => getSaleReport(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useGenerateSaleReportMutation = () => {
  return useMutation({
    mutationFn: data => generateSaleReport(data)
  })
}
export const useMembershipReportQuery = data => {
  return useQuery({
    queryKey: ['membershipReport', data],
    queryFn: () => getMembershipReport(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useGenerateMembershipReportMutation = () => {
  return useMutation({
    mutationFn: data => generateMembershipReport(data)
  })
}

export const useNetworkReportQuery = data => {
  return useQuery({
    queryKey: ['networkReport', data],
    queryFn: () => getNetworkReport(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
export const useGenerateNetworkReportMutation = () => {
  return useMutation({
    mutationFn: data => generateNetworkReport(data)
  })
}

export const useSettlementReportQuery = data => {
  return useQuery({
    queryKey: ['settlementReport', data],
    queryFn: () => getSettlementReport(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
export const useGenerateSettlementReportMutation = () => {
  return useMutation({
    mutationFn: data => generateSettlementReport(data)
  })
}

export const useAddChargeMutation = (details) => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: (details ) => addCharge(details),
    onSuccess: async data => {
      query.invalidateQueries('cart')
      showSuccess(data?.message || 'Charge added successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to add charge')
      return err
    }
  })
}