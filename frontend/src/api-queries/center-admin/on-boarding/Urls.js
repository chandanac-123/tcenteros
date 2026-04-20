import {
  classTypeApiCall,
  platformApiCall,
  onboardCreateApiCall,
  pricingPageApiCall,
  gsteApiCall,
  onboardFinalizeApiCall,
  getPlatformApiCall
} from './index'

export const getAllClassTypes = async () => {
  try {
    const response = await classTypeApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPlatformById = async (id) => {
  try {
    const response = await getPlatformApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllPlatforms = async () => {
  try {
    const response = await platformApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}

export const createOnboardCenter = async details => {
  try {
    const response = await onboardCreateApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPricingPage = async id => {
  try {
    const response = await pricingPageApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const calculateGst = async (id) => {
  try {
    const response = await gsteApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const finalizeOnboardCenter = async (details, id) => {
  try {
    const response = await onboardFinalizeApiCall(details, id);
    return response.data;
  } catch (error) {
    throw error;
  }
};