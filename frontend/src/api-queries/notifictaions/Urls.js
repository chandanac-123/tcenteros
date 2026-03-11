import { getAllTicketsApiCall, getPendingNetworkApiCall } from '.'

export const getAllTickets = async () => {
  try {
    const response = await getAllTicketsApiCall()
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
