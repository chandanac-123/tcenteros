import {
  generateConsolidatedExpensesReportApiCall,
  generateConsolidatedIncomeReportApiCall,
  generateConsolidatedSettlementsReportApiCall,
  getConsolidatedExpensesReportApiCall,
  getConsolidatedIncomeReportApiCall,
  getConsolidatedSettlementsReportApiCall
} from './index'

export const getConsolidatedIncomeReport = async data => {
  try {
    const response = await getConsolidatedIncomeReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getConsolidatedExpensesReport = async data => {
  try {
    const response = await getConsolidatedExpensesReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getConsolidatedSettlementsReport = async data => {
  try {
    const response = await getConsolidatedSettlementsReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const generateConsolidatedIncomeReport = async data => {
  try {
    const response = await generateConsolidatedIncomeReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const generateConsolidatedExpensesReport = async data => {
  try {
    const response = await generateConsolidatedExpensesReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const generateConsolidatedSettlementsReport = async data => {
  try {
    const response = await generateConsolidatedSettlementsReportApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}
