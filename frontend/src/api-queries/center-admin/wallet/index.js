import axiosInstance from "@api/axiosInstance"

export const createWalletApiCall = details =>
  axiosInstance.post('/center/center/wallet/create', details)
export const getWalletsummaryApiCall = () =>
  axiosInstance.get('/center/center/wallet/summary')
export const getWalletTransactionsApiCall = (details = {}) => {
  return axiosInstance.get(`/center/center/wallet/transactions`, {
    params: {
      page: details.page ?? 1,
      page_size: details.page_size ?? 10,
      type: details.type ?? '',
      transaction_type: details.transaction_type ?? '',
      status: details.status ?? '',
      start_date: details.start_date ?? '',
      end_date: details.end_date ?? ''
    }
  })
}
export const getWalletAmountApiCall = () =>
  axiosInstance.get('/center/center/wallet')