import {
  createMemberApiCall,
  getMemberApiCall,
  updateMemberApiCall,
  deleteMemberApiCall,
  getMemberByIdApiCall,
  getMemberTimeSlotApiCall,
  getMemberPlanApiCall
} from '../../api'

export const getAllMember = async data => {
  try {
    const response = await getMemberApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createMember = async details => {
  try {
    const response = await createMemberApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateMember = async (details, id) => {
  try {
    const response = await updateMemberApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}
export const deleteMember = async id => {
  try {
    const response = await deleteMemberApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMemberById = async id => {
  try {
    const response = await getMemberByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMemberTimeSlot = async id => {
  try {
    const response = await getMemberTimeSlotApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMemberPlan = async () => {
  try {
    const response = await getMemberPlanApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}