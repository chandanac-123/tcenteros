import axiosInstance from '@api/axiosInstance'

export const getAllTicketsApiCall = () => axiosInstance.get('/support/tickets')
export const getTicketByIdApiCall = id => axiosInstance.get(`/support/ticket/${id}`)
export const sendMessageApiCall = (data, id) =>
  axiosInstance.post(`/support/ticket/${id}/message`, data)
export const closeMessageApiCall = (data, id) =>
  axiosInstance.post(`/support/ticket/${id}/close`, data)

export const getPendingNetworkApiCall = () =>
  axiosInstance.get('/networking/networking/requests?status=pending')


export const getTimeSlotApiCall = () => axiosInstance.get('/membership/center/time-slots')
export const approveTimeSlotApiCall = (data, id) =>
  axiosInstance.post(`/membership/admin/approve-time-slot-change/${id}`, data)