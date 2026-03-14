import {
  updateCartApiCall,
  deleteCartApiCall,
  cartOpenApiCall,
  getCartAmountApiCall,
  checkoutCartApiCall,
  addtoCartApiCall,
  getSaleApiCall,
  getSaleByIdApiCall,
  getAllSaleApiCall,
  getAllSaleByIdApiCall,
  getMembershipByIdApiCall,
  getAllMembershipApiCall,
  getRenewMembershipByIdApiCall,
  renewMembershipApiCall,
  getIncomingNetworkApiCall,
  getNetworkByIdApiCall,
  getOutgoingNetworkApiCall,
  getSaleReportApiCall,
  getMembershipRevenueReportApiCall,
  getNetworkEarningReportApiCall,
  getTaxSummaryReportApiCall,
  getSettlementByIdApiCall,
  completeSettlementApiCall,
  getSettlementApiCall,
  addChargeApiCall
} from './index'

export const getSales = async data => {
  try {
    const response = await getSaleApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createCart = async (details, id) => {
  try {
    const response = await addtoCartApiCall(details,id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateCart = async (details, id) => {
  try {
    const response = await updateCartApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}
export const deleteCart = async id => {
  try {
    const response = await deleteCartApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const cartOpen = async () => {
  try {
    const response = await cartOpenApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getCartAmount = async data => {
  try {
    const response = await getCartAmountApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const checkoutCart = async data => {
  try {
    const response = await checkoutCartApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getSaleById = async id => {
  try {
    const response = await getSaleByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllSales = async data => {
  try {
    const response = await getAllSaleApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}
export const getAllSaleById = async id => {
  try {
    const response = await getAllSaleByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllMemberships = async (data) => {
  try {
    const response = await getAllMembershipApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMembershipById = async id => {
  try {
    const response = await getMembershipByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const renewMembership = async (data,id) => {
  try {
    const response = await renewMembershipApiCall(data,id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getRenewMembershipById = async id => {
  try {
    const response = await getRenewMembershipByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getIncomingNetwork = async (data) => {
  try {
    const response = await getIncomingNetworkApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getOutgoingNetwork = async (data) => {
  try {
    const response = await getOutgoingNetworkApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getNetworkById = async id => {
  try {
    const response = await getNetworkByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getSettlements = async (data) => {
  try {
    const response = await getSettlementApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getSettlementById = async (id) => {
  try {
    const response = await getSettlementByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const completeSettlement = async (id, data) => {
  try {
    const response = await completeSettlementApiCall(id, data)
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

export const getMembershipRevenueReport = async (data) => {
  try {
    const response = await getMembershipRevenueReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getInventorySaleReport = async (data) => {
  try {
    const response = await getInventorySaleReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getNetworkEarningReport = async (data) => {
  try {
    const response = await getNetworkEarningReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getTaxSummaryReport = async (data) => {
  try {
    const response = await getTaxSummaryReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const addCharge = async (data) => {
  try {
    const response = await addChargeApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}