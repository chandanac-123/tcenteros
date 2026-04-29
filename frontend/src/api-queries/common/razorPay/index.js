import axiosInstance from "@api/axiosInstance"


export const createNewPaymentOrder = async (payment_id) => {
    const response = await axiosInstance.post(
        `/auth/create-order/${payment_id}`
    );

    return response;
};

export const verifyPayment = async (params) => {
    const response = await axiosInstance.post(
        `/auth/verify`,null,
        { params }
    );

    return response;
};