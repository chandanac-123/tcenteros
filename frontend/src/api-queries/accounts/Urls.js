import {
  getAccountsLedgerApiCall,
  getAccountsIncomeApiCall,
  getAccountsTaxesApiCall
} from './index'

export const getAllLedger = async (params) => {
  try {
    const response = await getAccountsLedgerApiCall(params)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllIncome = async (params) => {
  try {
    const response = await getAccountsIncomeApiCall(params)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllTaxes = async (params) => {
  try {
    const response = await getAccountsTaxesApiCall(params)
    return response.data
  } catch (error) {
    throw error
  }
}
