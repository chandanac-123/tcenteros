import axiosInstance from "@api/axiosInstance";

export const getBranchApiCall = (data) =>
  axiosInstance.get(`/superadmin/superadmin/centers/branching-summary?page=${data?.page}`);
