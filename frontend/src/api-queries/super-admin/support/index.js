import axiosInstance from "@api/axiosInstance";

export const getSupportTickets = () =>
    axiosInstance.get("/support/tickets");

export const getSupportTicketById = (id) =>
    axiosInstance.get(`/support/ticket/${id}`);

export const openSupportTicket = (id) =>
    axiosInstance.post(`/support/ticket/${id}/open`);

export const sendSupportMessage = (id, data) => {
    console.log("Data", data);
    return axiosInstance.post(`/support/ticket/${id}/message`, data);
};

export const closeTicketById = (id) => {
    return axiosInstance.post(`/support/ticket/${id}/close`);
};

export const assignTicket = async ({ ticket_id, centeradmin_id }) => {    
    return axiosInstance.post(`/support/ticket/${ticket_id}/assign`, null, {params: { centeradmin_id }});
};