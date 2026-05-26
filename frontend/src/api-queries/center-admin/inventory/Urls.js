import {
  createProductApiCall,
  createSKUApiCall,
  deleteProductApiCall,
  deleteSKUApiCall,
  getProductApiCall,
  getSKUApiCall,
  updateProductApiCall,
  getStockApiCall,
  getStockTransactionApiCall,
  createStockApiCall,
  getInventoryProfitApiCall,
  getProductDropdownApiCall,
  getSaleReportApiCall,
  getPurchaseReportApiCall,
  getInventoryReportApiCall,
  getStockReportApiCall,
  getGenerateStockReportApiCall,
  getGenerateInventoryReportApiCall,
  getGeneratePurchaseReportApiCall,
  getGenerateSaleReportApiCall,
  inventoryDashboardApiCall,
  getInventoryProfitValueApiCall,
  createInventoryProfitApiCall,
  getProductByidApiCall
} from './index'

export const getAllSKU = async () => {
  try {
    const response = await getSKUApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createProduct = async details => {
  try {
    const response = await createProductApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateProduct = async (details, id) => {
  try {
    const response = await updateProductApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteProduct = async id => {
  try {
    const response = await deleteProductApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getProductById = async id => {
  try {
    const response = await getProductByidApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllProducts = async data => {
  try {
    const response = await getProductApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getDropdownProducts = async data => {
  try {
    const response = await getProductDropdownApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}


export const createSKU = async details => {
  try {
    const response = await createSKUApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteSKU = async id => {
  try {
    const response = await deleteSKUApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllStock = async data => {
  try {
    const response = await getStockApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllStockTransactions = async data => {
  try {
    const response = await getStockTransactionApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createStockEntry = async data => {
  try {
    const response = await createStockApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getInventoryProfit = async () => {
  try {
    const response = await getInventoryProfitApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getSaleReport = async (data) => {
  try {
    const response = await getSaleReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPurchaseReport = async (data) => {
  try {
    const response = await getPurchaseReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getInventoryReport = async (data) => {
  try {
    const response = await getInventoryReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}



export const getStockReport = async (data) => {
  try {
    const response = await getStockReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getGenerateSaleReport = async (data) => {
  try {
    const response = await getGenerateSaleReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}
export const getGeneratePurchaseReport = async (data) => {
  try {
    const response = await getGeneratePurchaseReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}
export const getGenerateInventoryReport = async (data) => {
  try {
    const response = await getGenerateInventoryReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}
export const getGenerateStockReport = async (data) => {
  try {
    const response = await getGenerateStockReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getDashboardData = async () => {
  try {
    const response = await inventoryDashboardApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getInventoryProfitValue = async () => {
  try {
    const response = await getInventoryProfitValueApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createInventoryProfit = async details => {
  try {
    const response = await createInventoryProfitApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}