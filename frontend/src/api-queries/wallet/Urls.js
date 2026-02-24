import { createWalletApiCall } from "../../api";

export const createWalletAmountApiCall = async (deposite) => {
    try {
        const response = await createWalletApiCall(deposite);
        return response.data
    } catch (err) {
        throw err;
    }
}