import {
  addBranchCountApiCall,
  createNewBranchDetailsApiCall,
  getBranchCategoriesListApiCall,
  getBranchPricesAndTaxApiCall,
  getPurchasedBranchesApiCall,
  getBranchCountApiCall
} from '../../api/index'

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
    console.error('Error at getBranchPricesAndTax() in Urls.js..', err)
    throw err
  }
}

export const getPurchasedBranches = async () => {
  try {
    const response = await getPurchasedBranchesApiCall()
    return response.data
  } catch (err) {
    console.error('Error at getPurchasedBranches() in Urls.js..', err)
    throw err
  }
}

export const getBranchCategoriesList = async () => {
  try {
    const response = await getBranchCategoriesListApiCall()
    return response.data
  } catch (err) {
    console.error('Error at getBranchCategoriesList() in Urls.js..', err)
    throw err
  }
}

export const createNewBranch = async details => {
  try {
    console.log('details in Url', details)
    const response = await createNewBranchDetailsApiCall(details)
    return response.data
  } catch (err) {
    console.error('Error at createNewBranch() in Urls.js..', err)
    console.log('ERR', err.response.data)
    throw err
  }
}

export const getBranchCount = async data => {
  try {
    const response = await getBranchCountApiCall(data)
    return response.data
  } catch (err) {
    console.error('Error at getBranchCount() in Urls.js..', err)
    throw err
  }
}
