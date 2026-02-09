import {
  createEmployeeApiCall,
  CreateEmployeeCategoriesApiCall,
  deleteEmployeeApiCall,
  getEmployeeApiCall,
  getEmployeeCategoriesApiCall,
  updateEmployeeApiCall
} from '../../api'

export const getAllCategories = async () => {
  try {
    const response = await getEmployeeCategoriesApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createCategory = async details => {
  try {
    const response = await CreateEmployeeCategoriesApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllEmployees = async () => {
  try {
    const response = await getEmployeeApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}
export const createEmployee = async details => {
  try {
    const response = await createEmployeeApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}
export const updateEmployee = async (details, id) => {
  try {
    const response = await updateEmployeeApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}
export const deleteEmployee = async id => {
  try {
    const response = await deleteEmployeeApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}
