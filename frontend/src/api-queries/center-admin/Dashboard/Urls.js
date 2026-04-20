import { dashboardApiCall } from './index'


export const getDashboardData = async () => {
  try {
    const response = await dashboardApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}