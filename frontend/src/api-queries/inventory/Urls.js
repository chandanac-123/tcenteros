import {
  createProductApiCall,
  getSKUApiCall
} from '../../api/index'

export const getAllSKU = async () => {
  try {
    const response = await getSKUApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createProduct = async (details) => {
  try {
    const response = await createProductApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

// export const updateSalary = async (details, id) => {
//   try {
//     const response = await updateSalaryApiCall(details, id)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }
// export const deleteSalary = async id => {
//   try {
//     const response = await deleteSalaryApiCall(id)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// export const getSalaryById = async id => {
//   try {
//     const response = await getSalaryByIdApiCall(id)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }