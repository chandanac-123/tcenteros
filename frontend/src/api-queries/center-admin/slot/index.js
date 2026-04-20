import axiosInstance from "@api/axiosInstance"

export const getSlotApiCall = () =>
  axiosInstance.get(`/center/center/time-slots`)
export const createSlotApiCall = details =>
  axiosInstance.post('/center/center/time-slots', details)
export const deleteSlotApiCall = id =>
  axiosInstance.delete(`/center/center/time-slots/${id}`)