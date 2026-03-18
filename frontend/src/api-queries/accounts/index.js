import axiosInstance from '@api/axiosInstance'

export const getAccountsLedgerApiCall = data =>
  axiosInstance.get(
    `/accounts/ledger?page=${data?.page || 1}&search=${data?.search || ''}`
  )
export const getAccountsIncomeApiCall = data =>
  axiosInstance.get(
    `/accounts/income?page=${data?.page || 1}&search=${data?.search || ''}`
  )
export const getAccountsTaxesApiCall = data =>
  axiosInstance.get(
    `/accounts/taxes?page=${data?.page || 1}&search=${data?.search || ''}`
  )
export const getAccountsExpensesApiCall = data =>
  axiosInstance.get(
    `/accounts/expenses?page=${data?.page || 1}&search=${data?.search || ''}`
  )
export const getAccountsPayrollApiCall = data =>
  axiosInstance.get(
    `/accounts/payroll?page=${data?.page || 1}&search=${data?.search || ''}`
  )
export const getAccountsInventoryApiCall = data =>
  axiosInstance.get(
    `/accounts/inventory-accounting?page=${data?.page || 1}&search=${
      data?.search || ''
    }`
  )
export const getAccountsSettlementsApiCall = data =>
  axiosInstance.get(
    `/accounts/settlements?page=${data?.page || 1}&search=${data?.search || ''}`
  )
export const getAccountsOverviewApiCall = () =>
  axiosInstance.get(`/accounts/overview`)
