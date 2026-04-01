import axiosInstance from '@api/axiosInstance'

export const getConsolidatedIncomeReportApiCall = data =>
  axiosInstance.get(
    `reports/consolidated-income?page=${data?.page}&start_date=${data?.date_from}&end_date=${data?.date_to}`
  )
export const getConsolidatedExpensesReportApiCall = data =>
  axiosInstance.get(
    `reports/consolidated-expenses?page=${data?.page}&start_date=${data?.date_from}&end_date=${data?.date_to}`
  )
export const getConsolidatedSettlementsReportApiCall = data =>
  axiosInstance.get(
    `reports/consolidated-settlements?page=${data?.page}&start_date=${data?.date_from}&end_date=${data?.date_to}`
  )

  
export const generateConsolidatedIncomeReportApiCall = data =>
  axiosInstance.post(
    `reports/consolidated-income?start_date=${data?.date_from}&end_date=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

export const generateConsolidatedExpensesReportApiCall = data =>
  axiosInstance.post(
    `reports/consolidated-expenses?start_date=${data?.date_from}&end_date=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

export const generateConsolidatedSettlementsReportApiCall = data =>
  axiosInstance.post(
    `reports/consolidated-settlements?start_date=${data?.date_from}&end_date=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )
