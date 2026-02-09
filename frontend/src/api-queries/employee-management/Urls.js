import { CreateEmployeeCategoriesApiCall, getEmployeeCategoriesApiCall } from "../../api"

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