import axiosInstance from "@api/axiosInstance"

export const getMembershipPlanApiCall = status =>
  axiosInstance.get(
    `/membership/memberships-plans${status == 'all' ? '' : `?status=${status}`}`
  )
export const createMembershipPlanApiCall = details =>
  axiosInstance.post('/membership/memberships-plans', details)
export const deleteMembershipPlanApiCall = id =>
  axiosInstance.delete(`/membership/memberships-plans/${id}`)
export const updateMembershipPlanApiCall = (details, id) =>
  axiosInstance.put(`/membership/memberships-plans/${id}`, details)
export const getMembershipPlanByIdApiCall = id =>
  axiosInstance.get(`/membership/memberships-plans/${id}`)
export const updateMembershipStatusApiCall = (details, id) =>
  axiosInstance.patch(
    `/membership/memberships-plans/${id}/status?status=${details.status}`,
    details
  )