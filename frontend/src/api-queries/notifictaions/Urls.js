import { getAllTicketsApiCall } from '.'


export const getAllTickets = async () => {
  try {
    const response = await getAllTicketsApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

