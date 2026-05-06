import axiosInstance from "@api/axiosInstance"

export const getCenterProfileApiCall = () =>
  axiosInstance.get(`/branching/centeradmin/branches/list-summary`)
export const updateCenterProfileApiCall = (details, id) =>
  axiosInstance.put(`/center/center/profile/update/${id}`, details)
export const getCenterProfileByIdApiCall = id =>
  axiosInstance.get(`/center/center/${id}/by-id`)

export const updateCenterProfilePicApiCall = details =>
  axiosInstance.put(`/center/centeradmin/profile-photo`, details, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }) // For updating profile photo in the center profile section
export const updateCentersProfileImageApiCall = details =>
  axiosInstance.put(`/center/center/image/update`, details, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }) // For updating centers and sub-branchs image from center information page
export const getCenterProfileInfoApiCall = () =>
  axiosInstance.get(`/center/centeradmin/profile`)
export const fetchCenterLocationApiCall = details =>
  axiosInstance.post(`/center/center-location/`, details)
export const getAllCenterApiCall = () =>
  axiosInstance.get(`/center/centers/accessible-centers`)

export const getCenterLocationApiCall = (id) =>
  axiosInstance.get(`/center/center-location/${id}`)