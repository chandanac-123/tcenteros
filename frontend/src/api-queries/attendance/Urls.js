import {
  createAttendanceApiCall,
  getAllEmployeeAttendanceApiCall,
  getAllEmployeesApiCall,
  getAllMemberAttendanceApiCall,
  deleteAttendanceApiCall
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

export const getAllMemberAttendance = async details => {
  try {
    const response = await getAllMemberAttendanceApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllEmployeeAttendance = async (details, id) => {
  try {
    const response = await getAllEmployeeAttendanceApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}


export const deleteAttendance = async id => {
  try {
    const response = await deleteAttendanceApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}
