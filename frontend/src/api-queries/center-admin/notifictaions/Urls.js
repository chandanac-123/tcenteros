import {
  closeMessageApiCall,
  getAllTicketsApiCall,
  getPendingNetworkApiCall,
  getTicketByIdApiCall,
  sendMessageApiCall,
  getTimeSlotApiCall,
  approveTimeSlotApiCall,
  getCenterRemindersApiCall,
  getNotificationCountApiCall
} from './index'

export const getAllTickets = async () => {
  try {
    const response = await getAllTicketsApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getTicketById = async id => {
  try {
    const response = await getTicketByIdApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const sendMessage = async (data, id) => {
  try {
    const response = await sendMessageApiCall(data, id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const closeMessage = async (data, id) => {
  try {
    const response = await closeMessageApiCall(data,id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllPendingNetwork = async () => {
  try {
    const response = await getPendingNetworkApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getTimeSlot = async () => {
  try {
    const response = await getTimeSlotApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const approveTimeSlot = async (data, id) => {
  try {
    const response = await approveTimeSlotApiCall(data, id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getCenterReminders = async () => {
  try {
    const response = await getCenterRemindersApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getNotificationCount = async () => {
  try {
    const response = await getNotificationCountApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}