import axiosInstance from "@api/axiosInstance";

export const getSubscriptionApiCall = (data) =>
  axiosInstance.get(
    `/superadmin/billing/subscriptions/details?page=${data?.page}&search=${data?.search || ""}`,
  );
export const getSubscriptionByIdApiCall = (id) =>
  axiosInstance.get(`/superadmin/billing/center/${id}/subscription-detail`);

export const getRenewalApiCall = (data) =>
  axiosInstance.get(
    `/superadmin/superadmin/billing/renewal-calendar?year=${data?.year}&month=${data?.month}`,
  );
export const getRenewalByIdApiCall = (data) =>
  axiosInstance.get(
    `/superadmin/superadmin/billing/renewal-calendar/day-details?target_date=${data}`,
  );

export const getRenewalExpiringApiCall = (data) =>
  axiosInstance.get(
    `/superadmin/superadmin/centers/subscriptions/expired?page=${data?.page}`,
  );

export const getBillingHistoryApiCall = (id) =>
  axiosInstance.get(
    `/superadmin/superadmin/billing/centers/subscription-history?center_id=${id}`,
  );

export const suspendCenterApiCall = (id, details) =>
  axiosInstance.post(`/superadmin/superadmin/centers/${id}/suspend`, details);

export const sendReminderApiCall = (id) => {
  axiosInstance.post(`/superadmin/superadmin/billing/renewal-calendar/send-reminder/${id}`);
}

export const failedSubscriptionApiCall = (details) =>
  axiosInstance.get(`/superadmin/superadmin/centers/failed-payments`, {
    params: {
      page: details?.page,
      page_size: details?.page_size,
    },
  });

export const suspendTheSubscription = (id) =>
  axiosInstance.post(`/superadmin/superadmin/centers/${id}/suspend`);

export const listSuspendedSubscription = () =>
  axiosInstance.get(`/superadmin/superadmin/centers/subscriptions/suspended`)

export const getNetworkOnlyApiCall = (data) =>
  axiosInstance.get(
    `/superadmin/superadmin/network-centers?page=${data?.page}`,
  );