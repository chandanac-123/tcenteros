import { de } from 'date-fns/locale'
import {
  createEmployeeApiCall,
  CreateEmployeeCategoriesApiCall,
  deleteEmployeeApiCall,
  DeleteEmployeeCategoriesApiCall,
  getEmployeeApiCall,
  getEmployeeCategoriesApiCall,
  updateEmployeeApiCall,
  UpdateEmployeeCategoriesApiCall,
  GetEmployeeCategoriesByIdApiCall,
  GetEmployeeByIdApiCall,
  updateEmployeeStatusApiCall,
  deleteMultipleEmployeeApiCall,
  getEmployeesDropdownApiCall,
  getPayrollApiCall,
  runPayrollApiCall,
  getPayCycleApiCall,
  createPayCycleApiCall
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

export const updateCategory = async (details, id) => {
  try {
    const response = await UpdateEmployeeCategoriesApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}
export const deleteCategory = async id => {
  try {
    const response = await DeleteEmployeeCategoriesApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getCategoryById = async id => {
  try {
    const response = await GetEmployeeCategoriesByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllEmployees = async data => {
  try {
    const response = await getEmployeeApiCall(data)
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

export const getEmployeeById = async id => {
  try {
    const response = await GetEmployeeByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateEmployeeStatus = async (details, id) => {
  try {
    const response = await updateEmployeeStatusApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteMultipleEmployees = async details => {
  try {
    const response = await deleteMultipleEmployeeApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getEmployeesDropdown = async () => {
  try {
    const response = await getEmployeesDropdownApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPayroll = async data => {
  try {
    const response = await getPayrollApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const runPayroll = async details => {
  try {
    const response = await runPayrollApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPayCycles = async () => {
  try {
    const response = await getPayCycleApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createPayCycle = async details => {
  try {
    const response = await createPayCycleApiCall(details)  
    return response.data
  } catch (error) {
    throw error
  }
}