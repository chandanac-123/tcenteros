import {
  createMemberApiCall,
  getMemberApiCall,
  updateMemberApiCall,
  deleteMemberApiCall,
  getMemberByIdApiCall,
  getMemberTimeSlotApiCall,
  getMemberPlanApiCall,
  getMemberCountApiCall,
  updateMemberStatusApiCall,
  getVisitorApiCall,
  getGuestApiCall,
  getVisitorByIdApiCall,
  getGuestByIdApiCall
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

export const getMemberCount = async () => {
  try {
    const response = await getMemberCountApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateMemberStatus = async (id, status) => {
  try {
    const response = await updateMemberStatusApiCall(id, status)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getVisitor = async data => {
  try {
    const response = await getVisitorApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getGuestInfo = async data => {
  try {
    const response = await getGuestApiCall(data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getVisitorById = async id => {
  try {
    const response = await getVisitorByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getGuestById = async id => {
  try {
    const response = await getGuestByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

