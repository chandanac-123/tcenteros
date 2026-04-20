import {
  
  createCenterTimeApiCall,
  deleteCenterTimeApiCall,
  getCenterTimeApiCall,
  updateCenterTimeApiCall
} from './index'

export const getAllCenterTime = async () => {
  try {
    const response = await getCenterTimeApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createCenterTime = async (details) => {
  try {
    const response = await createCenterTimeApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateCenterTime = async (details) => {
  try {
    const response = await updateCenterTimeApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}
export const deleteCenterTime = async id => {
  try {
    const response = await deleteCenterTimeApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}
