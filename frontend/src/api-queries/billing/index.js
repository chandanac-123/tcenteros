import axiosInstance from "@api/axiosInstance"

export const getAllSaleApiCall = data =>
  axiosInstance.get(`/inventory/pos/sales?page=${data?.page || 1}`)
export const addtoCartApiCall = (details, id) =>
  axiosInstance.post(`/inventory/sales/cart/items?cart_id=${id}`, details)
export const updateCartApiCall = (details, id) =>
  axiosInstance.patch(`/inventory/sales/cart/items/${id}`, details)
export const deleteCartApiCall = id =>
  axiosInstance.delete(`/inventory/sales/cart/items/${id}`)
export const cartOpenApiCall = () =>
  axiosInstance.post(`/inventory/sales/carts`)
export const getCartAmountApiCall = (id) =>
  axiosInstance.get(`/inventory/sales/cart/amount?cart_id=${id}`)
export const checkoutCartApiCall = data =>
  axiosInstance.post(`/inventory/sales/carts`,data)