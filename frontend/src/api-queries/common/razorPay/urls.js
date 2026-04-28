import { createNewPaymentOrder, verifyPayment } from "."


export const createNewPaymentOrder_Url = async (paymentDetails) => {
    try {
        const response = await createNewPaymentOrder(paymentDetails);
        console.log("Payment Response:", response);

        return response
    } catch (err) {
        console.error('Error at passing payment details for order_id creation', err)
        throw err
    }
}

export const verifyPayment_Urls = async (details) => {
    try {
        const response = await verifyPayment(details);
        console.log("Payment Response:", response);
        return response
    } catch (err) {
        console.error('Error at passing payment details for order_id creation', err)
        throw err
    }
}