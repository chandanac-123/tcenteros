import axiosInstance from "@api/axiosInstance"

export const addBranchCountApiCall = details =>
  axiosInstance.post(`/branching/centeradmin/branch/request`, details)
export const getBranchPricesAndTaxApiCall = () =>
  axiosInstance.get(`/branching/centeradmin/branch/request/summary`)
export const getPurchasedBranchesApiCall = () =>
  axiosInstance.get(`/branching/centeradmin/branch/purchased`)
export const getBranchCategoriesListApiCall = () =>
  axiosInstance.get(`/settings/superadmin/center-categories/`)
export const createNewBranchDetailsApiCall = ({ param, data }) => {
  return axiosInstance.post(
    `/branching/centeradmin/branch/create?payment_order_id=${param}`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}
export const getBranchCountApiCall = () =>
  axiosInstance.get('/branching/centeradmin/branch/purchased')