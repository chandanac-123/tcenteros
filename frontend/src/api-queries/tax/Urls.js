import {
  getTaxApiCall,
  createTaxApiCall,
  updateTaxApiCall,
  deleteTaxApiCall,
  getTaxByIdApiCall
} from '../../api/index'

export const getAllTax = async () => {
  try {
    const response = await getTaxApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createTax = async (details) => {
  try {
    const response = await createTaxApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateTax = async (details, id) => {
  try {
    const response = await updateTaxApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}
export const deleteTax = async id => {
  try {
    const response = await deleteTaxApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getTaxById = async id => {
  try {
    const response = await getTaxByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}