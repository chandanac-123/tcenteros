import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  generateConsolidatedExpensesReport,
  generateConsolidatedIncomeReport,
  generateConsolidatedSettlementsReport,
  getConsolidatedExpensesReport,
  getConsolidatedIncomeReport,
  getConsolidatedSettlementsReport
} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useConsolidatedIncomeReportQuery = data => {
  return useQuery({
    queryKey: ['consolidated-income', data],
    queryFn: () => getConsolidatedIncomeReport(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useConsolidatedExpensesReportQuery = data => {
  return useQuery({
    queryKey: ['consolidated-expenses', data],
    queryFn: () => getConsolidatedExpensesReport(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useConsolidatedSettlementsReportQuery = data => {
  return useQuery({
    queryKey: ['consolidated-settlements', data],
    queryFn: () => getConsolidatedSettlementsReport(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useGenerateConsolidatedIncomeReportMutation = () => {
  return useMutation({
    mutationFn: data => generateConsolidatedIncomeReport(data)
  })
}

export const useGenerateConsolidatedExpensesReportMutation = () => {
  return useMutation({
    mutationFn: data => generateConsolidatedExpensesReport(data)
  })
}

export const useGenerateConsolidatedSettlementsReportMutation = () => {
  return useMutation({
    mutationFn: data => generateConsolidatedSettlementsReport(data)
  })
}
