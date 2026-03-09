import axiosInstance from "@api/axiosInstance"

export const getTicketApiCall = id => axiosInstance.get(`/support/ticket/${id}`)
export const createTicketApiCall = (data, id) =>
  axiosInstance.post(`/support/ticket/${id}/message`, data)
export const getAllTicketsApiCall = () => axiosInstance.get('/support/tickets')