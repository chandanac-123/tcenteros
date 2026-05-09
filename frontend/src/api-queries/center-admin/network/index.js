import axiosInstance from "@api/axiosInstance";

export const addNetworkAmountApiCall = (data) =>
  axiosInstance.put(
    `/networking/center/networking-amount?amount=${data?.amount}`,
  );
export const getNetworkAmountApiCall = (id) =>
  axiosInstance.get(`/networking/center/${id}/networking-amount`);

export const networkToggleButtonApiCall = (enabled) =>
  axiosInstance.put("/networking/center/networking/toggle", { enabled });
export const getNetworkToggleStatusApiCall = () =>
  axiosInstance.get("/networking/center/network-enabled/me");
export const getUserNetworkListApiCall = (data) => {
  return axiosInstance.get(
    `/networking/networking/bookings?page=${data?.page}`,
  );
};
export const editApproveNetworkApiCall = (id) =>
  axiosInstance.put(`/networking/networking/access/approve`, null, {
    params: { network_membership_id: id },
  });
export const getNetworkingBookingByIdApiCall = (id) =>
  axiosInstance.get(`/networking/networking/booking/${id}`);
export const deleteNetworkBookingApiCall = (id) =>
  axiosInstance.delete(`/networking/networking/booking/${id}`);
