import axiosInstance from "@api/axiosInstance";

export const getBranchApiCall = (data) =>
  axiosInstance.get(
    `/superadmin/superadmin/centers/branching-summary?page=${data?.page}`,
  );

export const createBranchPriceApiCall = (data) =>
  axiosInstance.post(`/branching/superadmin/branching-price`,data);
