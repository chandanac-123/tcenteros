import {
  deleteSlotApiCall,
  createSlotApiCall,
  getSlotApiCall
} from '../../api/index'

export const getAllSlot = async () => {
  try {
    const response = await getSlotApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createSlot = async details => {
  try {
    const response = await createSlotApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteSlot = async id => {
  try {
    const response = await deleteSlotApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}
