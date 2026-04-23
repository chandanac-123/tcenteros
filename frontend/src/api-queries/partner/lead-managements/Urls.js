import { creatNewLeads, getAllLeads, updateLeadStatus } from ".";

export const getAllLeads_Url = async (data) => {
    try {
        const response = await getAllLeads(data)
        return response.data
    } catch (err) {
        console.log("Error at Getting All Leads::", err);
        throw err
    }
}

export const createNewLeads_Urls = async (data) => {
    try {
        const response = await creatNewLeads(data)
        return response.data
    } catch (err) {
        console.log("Error at create Leads::", err);
        throw err
    }
}

export const changeLeadStatus_Url = async ({ id, data }) => {
    try {
        const response = await updateLeadStatus(id, data)
        return response.data
    } catch (err) {
        console.log("Error at updating lead status::", err);
        throw err
    }
}