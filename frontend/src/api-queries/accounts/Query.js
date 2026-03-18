import { useQuery } from '@tanstack/react-query'
import {
  getAllLedger,
  getAllIncome,
  getAllTaxes,
  getAllExpenses,
  getAllPayroll,
  getAllInventory,
  getAllSettlements,
  getAccountsOverview
} from './Urls'

const defaultQueryOptions = {
  refetchOnWindowFocus: true,
  refetchOnMount: true
}

export const useAllLedgerQuery = (params) =>
  useQuery({ queryKey: ['accounts-ledger', params], queryFn: () => getAllLedger(params), ...defaultQueryOptions })
export const useAllIncomeQuery = (params) =>
  useQuery({ queryKey: ['accounts-income', params], queryFn: () => getAllIncome(params), ...defaultQueryOptions })
export const useAllTaxesQuery = (params) =>
  useQuery({ queryKey: ['accounts-taxes', params], queryFn: () => getAllTaxes(params), ...defaultQueryOptions })
export const useAllExpensesQuery = (params) =>
  useQuery({ queryKey: ['accounts-expenses', params], queryFn: () => getAllExpenses(params), ...defaultQueryOptions })
export const useAllPayrollQuery = (params) =>
  useQuery({ queryKey: ['accounts-payroll', params], queryFn: () => getAllPayroll(params), ...defaultQueryOptions })
export const useAllInventoryQuery = (params) =>
  useQuery({ queryKey: ['accounts-inventory', params], queryFn: () => getAllInventory(params), ...defaultQueryOptions })
export const useAllSettlementsQuery = (params) =>
  useQuery({ queryKey: ['accounts-settlements', params], queryFn: () => getAllSettlements(params), ...defaultQueryOptions })
export const useAccountsOverviewQuery = () =>
  useQuery({ queryKey: ['accounts-overview'], queryFn: getAccountsOverview, ...defaultQueryOptions })
