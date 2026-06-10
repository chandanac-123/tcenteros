import { createNewPaymentOrder, verifyPayment } from "."

export const createNewPaymentOrder_Url = async (payment_id) => {
    try {
        const response = await createNewPaymentOrder(payment_id);
        return response
    } catch (err) {
        throw err
    }
}

export const verifyPayment_Urls = async (params) => {
    try {
        const response = await verifyPayment(params);
        return response
    } catch (err) {
        throw err
    }
}