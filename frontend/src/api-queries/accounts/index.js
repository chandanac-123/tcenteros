import axiosInstance from '@api/axiosInstance'

export const getAccountsLedgerApiCall = data =>
  axiosInstance.get(`/accounts/ledger?page=${data?.page || 1}&search=${data?.search || ''}`)
export const getAccountsIncomeApiCall = data =>
  axiosInstance.get(`/accounts/income?page=${data?.page || 1}&search=${data?.search || ''}`)
export const getAccountsTaxesApiCall = data =>
  axiosInstance.get(`/accounts/taxes?page=${data?.page || 1}&search=${data?.search || ''}`)