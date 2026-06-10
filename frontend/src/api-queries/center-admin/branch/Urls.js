import {
  addBranchCountApiCall,
  createNewBranchDetailsApiCall,
  getBranchCategoriesListApiCall,
  getBranchPricesAndTaxApiCall,
  getPurchasedBranchesApiCall,
  getBranchCountApiCall
} from './index'

export const createBranchCount = async data => {
  try {
    const response = await addBranchCountApiCall(data)
    return response.data
  } catch (err) {
    throw err
  }
}

export const getBranchPricesAndTax = async () => {
  try {
    const response = await getBranchPricesAndTaxApiCall()
    return response.data
  } catch (err) {
    throw err
  }
}

export const getPurchasedBranches = async () => {
  try {
    const response = await getPurchasedBranchesApiCall()
    return response.data
  } catch (err) {
    throw err
  }
}

export const getBranchCategoriesList = async () => {
  try {
    const response = await getBranchCategoriesListApiCall()
    return response.data
  } catch (err) {
    throw err
  }
}

export const createNewBranch = async details => {
  try {
    const response = await createNewBranchDetailsApiCall(details)
    return response.data
  } catch (err) {
    throw err
  }
}

export const getBranchCount = async data => {
  try {
    const response = await getBranchCountApiCall(data)
    return response.data
  } catch (err) {
    throw err
  }
}
