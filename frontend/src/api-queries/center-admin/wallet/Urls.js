import {
  createWalletApiCall,
  getWalletAmountApiCall,
  getWalletsummaryApiCall,
  getWalletTransactionsApiCall
} from './index'

export const createWalletAmountApiCall = async deposite => {
  try {
    const response = await createWalletApiCall(deposite)
    return response.data
  } catch (err) {
    console.log('Error', err.response.data)
    throw err
  }
}

export const getWalletSummary = async () => {
  try {
    const response = await getWalletsummaryApiCall()
    return response.data
  } catch (err) {
    console.error('Error at getWalletsummary api call', err.response.data)
    throw err
  }
}

export const getWalletTransactions = async details => {
  try {
    console.log('Details', details)

    const response = await getWalletTransactionsApiCall(details)
    return response.data
  } catch (err) {
    console.error('Error at getWalletTransactions api call', err.response.data)
    throw err
  }
}

export const getWalletAmount = async () => {
  try {
    const response = await getWalletAmountApiCall()
    return response.data
  } catch (err) {
    console.error('Error at getWalletAmount api call', err.response.data)
    throw err
  }
}
