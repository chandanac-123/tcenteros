import {
    addNetworkAmountApiCall,
    deleteNetworkBookingApiCall,
    editApproveNetworkApiCall,
    getNetworkingBookingByIdApiCall,
    getNetworkToggleStatusApiCall,
    getUserNetworkListApiCall,
    networkToggleButtonApiCall
} from "../../api";

export const addNetworkAmount = async (data) => {
    try {
        const response = await addNetworkAmountApiCall(data);
        return response.data;
    } catch (err) {
        // console.error("Error at addNetworkAmount() api-queries/network/Urls.js::", err);
        throw err
    }
}

export const networkToggleButton = async (enabled) => {
    try {
        const response = await networkToggleButtonApiCall(enabled);
        return response.data
    } catch (err) {
        // console.error("Error at networkToggleButton() api-queries/network/Urls.js::", err);
        throw err
    }
}

export const getNetworkToggleButton = async () => {
    try {
        const response = await getNetworkToggleStatusApiCall();
        return response.data
    } catch (err) {
        // console.error("Error at getNetworkToggleButton() api-queries/network/Urls.js::", err);
        throw err
    }
}

export const getUserNetworkList = async (data) => {
    try {
        const response = await getUserNetworkListApiCall(data);
        return response.data
    } catch (err) {
        // console.error("Error at getUserNetworkList() api-queries/network/Urls.js::", err);
        throw err
    }
}

export const editApproveStatusNetwork = async (id) => {
    try {        
        const response = await editApproveNetworkApiCall(id);
        return response.data
    } catch (err) {
        console.log("ERRRE",err.response.data);
        
        console.error("Error at editApproveStatusNetwork() api-queries/network/Urls.js::", err);
        throw err
    }
}

export const getNetworkingBookingById = async (id) => {
    try {
        const response = await getNetworkingBookingByIdApiCall(id);
        return response.data
    } catch (err) {
        // console.error("Error at getNetworkingBookingById() api-queries/network/Urls.js::", err);
        throw err
    } 
}

export const deleteNetworkBooking = async (id) => {
    try {
        const response = await deleteNetworkBookingApiCall(id); 
        return response.data
    } catch (err) {
        // console.error("Error at deleteNetworkBooking() api-queries/network/Urls.js::", err);
        throw err
    }   
}