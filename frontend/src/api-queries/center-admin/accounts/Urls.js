import {
  getAccountsLedgerApiCall,
  getAccountsIncomeApiCall,
  getAccountsTaxesApiCall,
  getAccountsExpensesApiCall,
  getAccountsPayrollApiCall,
  getAccountsInventoryApiCall,
  getAccountsSettlementsApiCall,
  getAccountsOverviewApiCall
} from './index'

const handleApi = apiFn => async (params) => {
  try {
    const response = await apiFn(params)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllLedger = handleApi(getAccountsLedgerApiCall)
export const getAllIncome = handleApi(getAccountsIncomeApiCall)
export const getAllTaxes = handleApi(getAccountsTaxesApiCall)
export const getAllExpenses = handleApi(getAccountsExpensesApiCall)
export const getAllPayroll = handleApi(getAccountsPayrollApiCall)
export const getAllInventory = handleApi(getAccountsInventoryApiCall)
export const getAllSettlements = handleApi(getAccountsSettlementsApiCall)

export const getAccountsOverview = async () => {
  try {
    const response = await getAccountsOverviewApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}
