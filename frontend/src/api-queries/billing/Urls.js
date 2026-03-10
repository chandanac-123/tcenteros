import {

  updateCartApiCall,
  deleteCartApiCall,
  cartOpenApiCall,
  getCartAmountApiCall,
  checkoutCartApiCall,
  addtoCartApiCall,
  getAllSaleApiCall
} from './index'

export const getAllSales = async data => {
  try {
    const response = await getAllSaleApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createCart = async (details, id) => {
  try {
    const response = await addtoCartApiCall(details,id)
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

export const cartOpen = async () => {
  try {
    const response = await cartOpenApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getCartAmount = async data => {
  try {
    const response = await getCartAmountApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const checkoutCart = async data => {
  try {
    const response = await checkoutCartApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

