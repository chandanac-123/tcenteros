import axiosInstance from '@api/axiosInstance'

export const getAllTicketsApiCall = () => axiosInstance.get('/support/tickets')
export const getTicketByIdApiCall = id => axiosInstance.get(`/support/ticket/${id}`)
export const sendMessageApiCall = (data, id) =>
  axiosInstance.post(`/support/ticket/${id}/message`, data,{
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
export const closeMessageApiCall = (data, id) =>
  axiosInstance.post(`/support/ticket/${id}/close`, data)

export const getPendingNetworkApiCall = () =>
  axiosInstance.get('/networking/networking/requests', {
    params: {
      status: ['pending', 'approve']
    }
  });


export const getTimeSlotApiCall = () => axiosInstance.get('/membership/admin/time-slot-change-requests')
export const approveTimeSlotApiCall = (data, id) =>
  axiosInstance.post(`/membership/admin/approve-time-slot-change/${id}`, data)
export const getCenterRemindersApiCall = () => axiosInstance.get('/center/centeradmin/reminders')

export const getNotificationCountApiCall = () => axiosInstance.get('/support/admin/notification-count')
