import axiosInstance from '@api/axiosInstance'

export const getConsolidatedIncomeReportApiCall = data =>
  axiosInstance.get(
    `reports/consolidated-income?page=${data?.page}&date_from=${data?.date_from}&date_to=${data?.date_to}`
  )
export const getConsolidatedExpensesReportApiCall = data =>
  axiosInstance.get(
    `reports/consolidated-expenses?page=${data?.page}&date_from=${data?.date_from}&date_to=${data?.date_to}`
  )
export const getConsolidatedSettlementsReportApiCall = data =>
  axiosInstance.get(
    `reports/consolidated-settlements?page=${data?.page}&date_from=${data?.date_from}&date_to=${data?.date_to}`
  )

export const generateConsolidatedIncomeReportApiCall = data =>
  axiosInstance.post(
    `reports/consolidated-income?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

export const generateConsolidatedExpensesReportApiCall = data =>
  axiosInstance.post(
    `reports/consolidated-expenses?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )

export const generateConsolidatedSettlementsReportApiCall = data =>
  axiosInstance.post(
    `reports/consolidated-settlements?date_from=${data?.date_from}&date_to=${data?.date_to}&format=${data?.format}`,
    {},
    { responseType: 'blob' }
  )
