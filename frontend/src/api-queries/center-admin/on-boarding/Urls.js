import {
  classTypeApiCall,
  platformApiCall,
  onboardCreateApiCall,
  pricingPageApiCall,
  gsteApiCall,
  onboardFinalizeApiCall,
  getPlatformApiCall,
  getInvoiceApiCall,
  getResellerApiCall,
  getAllCentersOnBoarding,
  razorpayFailureApiCall,
  retryRazorpayPaymentApiCall,
  partnerRazorpayFailureApiCall,
  partnerRetryPaymentApiCall
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

export const getInvoice = async (id) => {
  try {
    const response = await getInvoiceApiCall(id)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllResellers = async () => {
  try {
    const response = await getResellerApiCall()
    return response.data
  } catch (error) {
    throw error
  }
}
export const getAllOnboardingCenters = async () => {
  try {
    const response = await getAllCentersOnBoarding()
    console.log("Response Centers", response);
    return response.data
  } catch (err) {
    console.error("Error at All center fetching on onboard", err);
    throw err
  }
}

export const razorpayFailure = async (paymentOrderId) => {
  try {
    const response = await razorpayFailureApiCall(paymentOrderId);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const retryRazorpayPayment = async ({ onboardId, paymentId }) => {
  const response = await retryRazorpayPaymentApiCall({
    onboardId,
    paymentId,
  });

  return response.data;
};

export const partnerRazorpayFailure = async (paymentOrderId) => {
  try {
    const response = await partnerRazorpayFailureApiCall(paymentOrderId);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const partnerRetryRazorpayPayment = async (paymentId) => {
  const response = await partnerRetryPaymentApiCall(paymentId);
  return response.data;
};
