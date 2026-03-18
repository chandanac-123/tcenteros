import {
  updateCenterProfileApiCall,
  getCenterProfileApiCall,
  getCenterProfileByIdApiCall,
  updateCenterProfilePicApiCall,
  updateCentersProfileImageApiCall,
  getCenterProfileInfoApiCall,
  fetchCenterLocationApiCall,
  getAllCenterApiCall
} from '../../api/index'

export const getProfile = async () => {
  try {
    const response = await getCenterProfileApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateProfile = async (details, id) => {
  try {
    const response = await updateCenterProfileApiCall(details,id)
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

export const updateProfilePic = async details => {
  try {
    const response = await updateCenterProfilePicApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateProfileImage = async details => {
  try {
    const response = await updateCentersProfileImageApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getProfileInfo = async details => {
  try {
    const response = await getCenterProfileInfoApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const fetchCenterLocation = async details => {
  try {
    const response = await fetchCenterLocationApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const fetchAllCenters = async details => {
  try {
    const response = await getAllCenterApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}