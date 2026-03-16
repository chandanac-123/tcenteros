import axiosInstance from '@api/axiosInstance'

export const getSaleApiCall = data =>
  axiosInstance.get(`/inventory/pos/sales?page=${data?.page || 1}`)
export const addtoCartApiCall = (details, id) =>
  axiosInstance.post(`/inventory/sales/cart/items?cart_id=${id}`, details)
export const updateCartApiCall = (details, id) =>
  axiosInstance.patch(`/inventory/sales/cart/items/${id}`, details)
export const deleteCartApiCall = id =>
  axiosInstance.delete(`/inventory/sales/cart/items/${id}`)
export const cartOpenApiCall = () =>
  axiosInstance.post(`/inventory/sales/carts`)
export const getCartAmountApiCall = id =>
  axiosInstance.get(`/inventory/sales/cart/amount?cart_id=${id}`)
export const checkoutCartApiCall = data =>
  axiosInstance.post(`/inventory/sales/carts`, data)
export const getSaleByIdApiCall = id =>
  axiosInstance.get(`/inventory/pos/sales/${id}`)

export const getAllSaleApiCall = data =>
  axiosInstance.get(
    `/billing/billing/sales?page=${data?.page || 1}&customer_search=${
      data?.search || ''
    }&payment_method_filter=${data?.payment_method || ''}&order_type=${
      data?.transaction_type || ''
    }`
  )
export const getAllSaleByIdApiCall = id =>
  axiosInstance.get(`/billing/billing/sales/${id}`)

export const getAllMembershipApiCall = data =>
  axiosInstance.get(
    `/billing/billing/memberships?page=${data?.page || 1}&search=${
      data?.search || ''
    }`
  )
export const getMembershipByIdApiCall = id =>
  axiosInstance.get(`/billing/billing/memberships/${id}`)
export const renewMembershipApiCall = (details, id) =>
  axiosInstance.post(`/membership/center/members/${id}/renew-membership`, details)
export const getRenewMembershipByIdApiCall = id =>
  axiosInstance.get(`/billing/billing/memberships/${id}/renewal-details`)

export const getIncomingNetworkApiCall = data =>
  axiosInstance.get(
    `/billing/billing/network-visits/incoming?page=${data?.page || 1}&search=${
      data?.search || ''
    }`
  )
export const getOutgoingNetworkApiCall = data =>
  axiosInstance.get(
    `/billing/billing/network-visits/outgoing?page=${data?.page || 1}&search=${
      data?.search || ''
    }`
  )
export const getNetworkByIdApiCall = id =>
  axiosInstance.get(`/billing/billing/network-visits/${id}`)

export const getSettlementApiCall = data =>
  axiosInstance.get(
    `/billing/billing/settlements?page=${data?.page || 1}&status_filter=${
      data?.payment_status || ''
    }&period_type=${data?.period_type || ''}`
  )
export const getSettlementByIdApiCall = id =>
  axiosInstance.get(`/billing/billing/settlements/${id}`)
export const completeSettlementApiCall = (id, data) =>
  axiosInstance.post(`/billing/billing/settlements/${id}/mark-completed`, data)
export const addChargeApiCall = (data) =>
  axiosInstance.post(`/billing/billing/miscellaneous-transactions`, data)

export const getSaleReportApiCall = data =>
  axiosInstance.get(`/billing/billing/reports/sales?page=${data?.page || 1}&date_from=${data?.date_from}&date_to=${data?.date_to}`)
export const getGenerateSaleReportApiCall = data =>
  axiosInstance.post(
    `billing/billing/reports/generate/sales?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

export const getMembershipReportApiCall = data =>
  axiosInstance.get(`/billing/billing/reports/memberships?page=${data?.page || 1}&date_from=${data?.date_from}&date_to=${data?.date_to}`)
export const getGenerateMembershipReportApiCall = data =>
  axiosInstance.post(
    `billing/billing/reports/generate/memberships?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

export const getNetworkReportApiCall = data =>
  axiosInstance.get(`/billing/billing/reports/networking?page=${data?.page || 1}&date_from=${data?.date_from}&date_to=${data?.date_to}`)
export const getGenerateNetworkReportApiCall = data =>
  axiosInstance.post(
    `billing/billing/reports/generate/networking?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )


export const getSettlementReportApiCall = data =>
  axiosInstance.get(`/billing/billing/reports/settlements?page=${data?.page || 1}&date_from=${data?.date_from}&date_to=${data?.date_to}`)
export const getGenerateSettlementReportApiCall = data =>
  axiosInstance.post(
    `billing/billing/reports/generate/settlements?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

  export const billingDashboardApiCall = data =>
    axiosInstance.get(`/billing/billing/dashboard`, data)