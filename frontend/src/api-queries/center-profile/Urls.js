import {
  updateCenterProfileApiCall,
  getCenterProfileApiCall,
  getCenterProfileByIdApiCall
} from '../../api/index'

export const getProfile = async () => {
  try {
    const response = await getCenterProfileApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateProfile = async details => {
  try {
    const response = await updateCenterProfileApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getProfileById = async id => {
  try {
    const response = await getCenterProfileByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}
