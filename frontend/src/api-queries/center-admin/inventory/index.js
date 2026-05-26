import axiosInstance from '@api/axiosInstance'

//Inventory API
export const createProductApiCall = data =>
  axiosInstance.post(`/inventory/products/create-with-stock`, data)
export const getSKUApiCall = data =>
  axiosInstance.get(`/settings/superadmin/center/sku-categories`, data)
export const getProductApiCall = data =>
  axiosInstance.get(`inventory/products?page=${data?.page}`)
export const addStockApiCall = (details, id) =>
  axiosInstance.post(`/inventory/products/${id}/add-stock`, details)
export const deleteProductApiCall = id =>
  axiosInstance.delete(`/inventory/products/${id}`)
export const getProductByidApiCall = id =>
  axiosInstance.get(`/inventory/products/${id}`)
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
    `inventory/reports/sales?page=${data?.page}&date_from=${data?.date_from
    }&date_to=${data?.date_to}&page_size=${10}`
  )
export const getPurchaseReportApiCall = data =>
  axiosInstance.get(
    `inventory/reports/purchase?page=${data?.page}&date_from=${data?.date_from}&date_to=${data?.date_to}`
  )
export const getInventoryReportApiCall = data =>
  axiosInstance.get(`inventory/reports/inventory?page=${data?.page}`)

export const getStockReportApiCall = data =>
  axiosInstance.get(
    `inventory/reports/stock-movement?page=${data?.page}&date_from=${data?.date_from}&date_to=${data?.date_to}`
  )

export const getGenerateSaleReportApiCall = data =>
  axiosInstance.post(
    `inventory/reports/generate/sales?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

export const getGeneratePurchaseReportApiCall = data =>
  axiosInstance.post(
    `inventory/reports/generate/purchase?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

export const getGenerateInventoryReportApiCall = data =>
  axiosInstance.post(
    `inventory/reports/generate/inventory?format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

export const getGenerateStockReportApiCall = data =>
  axiosInstance.post(
    `inventory/reports/generate/stock-movement?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

export const inventoryDashboardApiCall = data =>
  axiosInstance.get(`/inventory/dashboard`, data)

//Inventory profit
export const getInventoryProfitValueApiCall = data =>
  axiosInstance.get(`/inventory/inventory-profit/`)
export const createInventoryProfitApiCall = details =>
  axiosInstance.post('/inventory/inventory-profit/', details)
