import {
  getPermissionCall,
  createPermissionApiCall,
} from './index'

export const getAllPermission = async () => {
  try {
    const response = await getPermissionCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createPermission = async (details) => {
  try {
    const response = await createPermissionApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

