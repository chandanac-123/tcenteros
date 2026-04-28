import axiosInstance from "@api/axiosInstance"


export const createNewPaymentOrder = async (paymentDetails) => {
    const res = await axiosInstance.post(
        `/center/billing/onboarding/create-order/${paymentDetails.reference_id}`,
    );
    console.log("API raw response:", res);

    return res.data;
};

export const verifyPayment =async(details)=>{
    axiosInstance.post(`/center/billing/onboarding/finalize/${details.reference_id}`)
}