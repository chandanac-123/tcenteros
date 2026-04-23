import { dashboardApiCall ,renewSubscriptionApiCall} from './index'


export const getDashboardData = async () => {
  try {
    const response = await dashboardApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getRenewSubscriptionData = async () => {
  try {
    const response = await renewSubscriptionApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}