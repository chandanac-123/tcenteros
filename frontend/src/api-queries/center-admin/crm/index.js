import axiosInstance from "@api/axiosInstance";

export const getMemberApiCall = (data) =>
  axiosInstance.get(`/membership/center/members?page=${data?.page}`);
export const createMemberApiCall = (details) =>
  axiosInstance.post("/membership/center/members", details);
export const updateMemberApiCall = (details, id) =>
  axiosInstance.patch(`/membership/center/members/${id}`, details);
export const getMemberByIdApiCall = (id) =>
  axiosInstance.get(`/membership/center/members/${id}`);
export const deleteMemberApiCall = (id) =>
  axiosInstance.delete(`/membership/center/members/${id}`);
export const getMemberTimeSlotApiCall = (id) =>
  axiosInstance.get(`/membership/center/time-slots?center_id=${id}`);
export const getMemberPlanApiCall = () =>
  axiosInstance.get(`/membership/memberships-plans-mini`);
export const getActiveMemberPlanApiCall = () =>
  axiosInstance.get(`/membership/memberships-plans-mini?status=active`);
export const getMemberCountApiCall = () =>
  axiosInstance.get(`/membership/center/member-counts`);
export const updateMemberStatusApiCall = (id, status) =>
  axiosInstance.patch(
    `/membership/center/members/${id}/status?status=${status}`,
  );

export const getVisitorApiCall = (data) =>
  axiosInstance.get(`/membership/center/visitors?page=${data?.page}`);
export const getGuestApiCall = (data) =>
  axiosInstance.get(`/membership/center/guests?page=${data?.page}`);
export const getVisitorByIdApiCall = (id) =>
  axiosInstance.get(`/membership/center/visitors/${id}`);
export const getGuestByIdApiCall = (id) =>
  axiosInstance.get(`/membership/center/guests/${id}`);

export const getLeadExcelApiCall = (formData) =>
  axiosInstance.post("/membership/import-excel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getLeadApiCall = (data) =>
  axiosInstance.get(`/membership/leads?page=${data?.page}`);
