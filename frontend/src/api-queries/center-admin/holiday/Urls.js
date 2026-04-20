import {
  deleteHolidayApiCall,
  createHolidayApiCall,
  getHolidayApiCall
} from './index'

export const getAllHoliday = async () => {
  try {
    const response = await getHolidayApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createHoliday = async details => {
  try {
    const response = await createHolidayApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteHoliday = async id => {
  try {
    const response = await deleteHolidayApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}
