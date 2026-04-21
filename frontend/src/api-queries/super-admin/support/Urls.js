import { assignTicket, closeTicketById, getSupportTicketById, getSupportTickets, openSupportTicket, sendSupportMessage } from ".";

export const getSupportTickets_Url = async () => {
    try {
        const response = await getSupportTickets();
        return response.data;
    } catch (err) {
        console.error("Error fetching support tickets", err);
        throw err;
    }
};

export const getSupportTicketById_Url = async (id) => {
    try {
        const response = await getSupportTicketById(id);
        return response.data;
    } catch (err) {
        console.error("Error fetching ticket by id", err);
        throw err;
    }
};

export const openSupportTicket_Url = async (id) => {
    try {
        const res = await openSupportTicket(id);
        return res.data;
    } catch (err) {
        console.error("Error opening ticket:", err);
        throw err;
    }
};


export const sendSupportMessage_Url = async ({ id, data }) => {
    console.log("Da", data);
    try {
        const response = await sendSupportMessage(id, data);
        return response.data;
    } catch (err) {
        console.error("Error sending message", err);
        throw err;
    }
};

export const closeTicketById_Url = async ({ id }) => {
    try {
        const response = await closeTicketById(id);
        return response.data;

    } catch (err) {
        console.error("Error at closing Ticket", err);
        throw err;
    }
};

export const assignTicketById_Url = async ({ ticket_id, centeradmin_id }) => {
    try {
        const response = await assignTicket({ ticket_id, centeradmin_id });
        return response.data;
    } catch (err) {
        console.error("Error at Assign Ticket to center admin", err);
        throw err;
    }
};