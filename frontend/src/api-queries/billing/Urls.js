import {
  getCartApiCall,
  createCartApiCall,
  updateCartApiCall,
  deleteCartApiCall
} from '../../api/index'

export const getAllCarts = async data => {
  try {
    const response = await getCartApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createCart = async details => {
  try {
    const response = await createCartApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateCart = async (details, id) => {
  try {
    const response = await updateCartApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}
export const deleteCart = async id => {
  try {
    const response = await deleteCartApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

// export const getSalaryById = async id => {
//   try {
//     const response = await getSalaryByIdApiCall(id)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }
