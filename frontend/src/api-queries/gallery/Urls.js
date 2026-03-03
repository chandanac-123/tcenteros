import {
  getGalleryApiCall,
  createGalleryApiCall,
  deleteGalleryApiCall
} from '../../api'

export const getAllGallery = async id => {
  try {
    const response = await getGalleryApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createGallery = async details => {
  try {
    const response = await createGalleryApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteGallery = async id => {
  try {
    const response = await deleteGalleryApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}
