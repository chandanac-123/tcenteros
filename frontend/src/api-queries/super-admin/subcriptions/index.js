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
