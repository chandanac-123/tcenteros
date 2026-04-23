import axiosInstance from "@api/axiosInstance";

export const getAllLeads = ({ lead_status, source, skip = 0, limit = 10 }) =>
    axiosInstance.get('/partner/leads', {
        params: {
            lead_status,
            source,
            skip,
            limit,
        },
    });

export const creatNewLeads = (data) =>
    axiosInstance.post('/partner/leads', data);

export const updateLeadStatus = (lead_id, data) =>
    axiosInstance.patch(`/partner/leads/${lead_id}/status`, data);