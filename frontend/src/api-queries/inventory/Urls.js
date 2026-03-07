import {
  createProductApiCall,
  createSKUApiCall,
  deleteProductApiCall,
  deleteSKUApiCall,
  getProductApiCall,
  getSKUApiCall,
  updateProductApiCall
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

export const updateProduct = async (details, id) => {
  try {
    const response = await updateProductApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteProduct = async id => {
  try {
    const response = await deleteProductApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllProducts = async (data) => {
  try {
    const response = await getProductApiCall(data )
    return response.data
  } catch (error) {
    throw error
  }
}

export const createSKU = async (details) => {
  try {
    const response = await createSKUApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteSKU = async id => {
  try {
    const response = await deleteSKUApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}