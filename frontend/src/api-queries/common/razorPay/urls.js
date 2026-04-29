import { createNewPaymentOrder, verifyPayment } from "."


export const createNewPaymentOrder_Url = async (payment_id) => {
    console.log("PAPA", payment_id);
    try {

        const response = await createNewPaymentOrder(payment_id);
        console.log("Payment Response:", response);

        return response
    } catch (err) {
        console.error('Error at passing payment details for order_id creation', err)
        throw err
    }
}

export const verifyPayment_Urls = async (params) => {
    try {
        const response = await verifyPayment(params);
        console.log("Payment Response:", response);
        return response
    } catch (err) {
        console.error('Error at passing payment details for order_id creation', err)
        throw err
    }
}