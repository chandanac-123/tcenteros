import {
  getSalaryApiCall,
  createSalaryApiCall,
  updateSalaryApiCall,
  getSalaryByIdApiCall,
  deleteSalaryApiCall
} from '../../api/index'

export const getAllSalaries = async (data) => {
  try {
    const response = await getSalaryApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createSalary = async (details) => {
  try {
    const response = await createSalaryApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateSalary = async (details, id) => {
  try {
    const response = await updateSalaryApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}
export const deleteSalary = async id => {
  try {
    const response = await deleteSalaryApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getSalaryById = async id => {
  try {
    const response = await getSalaryByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}