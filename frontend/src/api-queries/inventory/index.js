import axiosInstance from '@api/axiosInstance'

//Inventory API
export const createProductApiCall = data =>
  axiosInstance.post(`/inventory/products`, data)
export const getSKUApiCall = data =>
  axiosInstance.get(`/settings/superadmin/center/sku-categories`, data)
export const getProductApiCall = data =>
  axiosInstance.get(`inventory/products?page=${data?.page}`)
export const updateProductApiCall = (details, id) =>
  axiosInstance.patch(`/inventory/products/${id}`, details)
export const deleteProductApiCall = id =>
  axiosInstance.delete(`/inventory/products/${id}`)
export const createStockApiCall = data =>
  axiosInstance.post(`/inventory/stock/adjust`, data)
export const getStockApiCall = data =>
  axiosInstance.get(`/inventory/stock-history?page=${data?.page}`)
export const createSKUApiCall = data =>
  axiosInstance.post(`/settings/superadmin/center/sku-categories`, data)
export const deleteSKUApiCall = id =>
  axiosInstance.delete(`/settings/superadmin/center/sku-categories/${id}`)
export const getStockTransactionApiCall = data =>
  axiosInstance.get(`/inventory/stock-transactions?page=${data?.page}`)
export const getInventoryProfitApiCall = () =>
  axiosInstance.get(`/settings/superadmin/settings/inventory-profit`)
export const getProductDropdownApiCall = () =>
  axiosInstance.get(`/inventory/products/lookup`)

//INVENTORY REPORTS

export const getSaleReportApiCall = data =>
  axiosInstance.get(
    `inventory/reports/sales?page=${data?.page}&date_from=${data?.date_from}&date_to=${data?.date_to}&page_size=${10}`
  )
export const getPurchaseReportApiCall = data =>
  axiosInstance.get(
    `inventory/reports/purchases?page=${data?.page}&date_from=${data?.date_from}&date_to=${data?.date_to}`
  )
export const getInventoryReportApiCall = data =>
  axiosInstance.get(
    `inventory/reports/inventory?page=${data?.page}&date_from=${data?.date_from}&date_to=${data?.date_to}`
  )
export const getStockReportApiCall = data =>
  axiosInstance.get(
    `inventory/reports/stock-movement?page=${data?.page}&date_from=${data?.date_from}&date_to=${data?.date_to}`
  )

// export const getGenerateSaleReportApiCall = data =>
//   axiosInstance.post(
//     `inventory/reports/generate/sales?date_from=${data?.date_from}&date_to=${data?.date_to}&format=pdf`
//   )
export const getGenerateSaleReportApiCall = data =>
  axiosInstance.post(
    `inventory/reports/generate/sales?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )
export const getGeneratePurchaseReportApiCall = data =>
  axiosInstance.post(
    `inventory/reports/generate/purchases?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`
  )
export const getGenerateInventoryReportApiCall = data =>
  axiosInstance.post(
    `inventory/reports/generate/inventory?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`
  )
export const getGenerateStockReportApiCall = data =>
  axiosInstance.post(
    `inventory/reports/generate/stock-movement?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`
  )
