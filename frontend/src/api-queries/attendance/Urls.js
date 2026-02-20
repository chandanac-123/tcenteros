import {
  createAttendanceApiCall,
  getAllEmployeesApiCall
} from '../../api/index'

export const getAllEmployees = async () => {
  try {
    const response = await getAllEmployeesApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createAttendance = async details => {
  try {
    const response = await createAttendanceApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}