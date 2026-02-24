import {
  getMembershipPlanApiCall,
  createMembershipPlanApiCall,
  deleteMembershipPlanApiCall,
  updateMembershipPlanApiCall,
  getMembershipPlanByIdApiCall,
  updateMembershipStatusApiCall
} from '../../api'

export const getAllPlans = async () => {
  try {
    const response = await getMembershipPlanApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createPlan = async details => {
  try {
    const response = await createMembershipPlanApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

  export const updatePlan = async (details, id) => {
    try {
      const response = await updateMembershipPlanApiCall(details, id)
      return response.data
    } catch (error) {
      throw error
    }
  }
export const deletePlan = async id => {
  try {
    const response = await deleteMembershipPlanApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPlanById = async id => {
  try {
    const response = await getMembershipPlanByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateStatusPlan = async (details, id) => {
  try {
    const response = await updateMembershipStatusApiCall(details, id)
    return response.data
  } catch (error) {
    throw error
  }
}