import { useQuery } from '@tanstack/react-query'
import { getAllLedger, getAllIncome, getAllTaxes } from './Urls'

export const useAllLedgerQuery = (params) => {
  return useQuery({
    queryKey: ['accounts-ledger', params],
    queryFn: () => getAllLedger(params),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useAllIncomeQuery = (params) => {
  return useQuery({
    queryKey: ['accounts-income', params],
    queryFn: () => getAllIncome(params),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useAllTaxesQuery = (params) => {
  return useQuery({
    queryKey: ['accounts-taxes', params],
    queryFn: () => getAllTaxes(params),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
