import axiosInstance from './axiosInstance'

//ONBOARDING
export const classTypeApiCall = () =>
  axiosInstance.get('/settings/superadmin/center-categories/')
export const platformApiCall = () => axiosInstance.get('/platforms/')
export const getPlatformApiCall = id => axiosInstance.get(`/platforms/${id}`)
export const onboardCreateApiCall = details =>
  axiosInstance.post('/center/onboarding/temp', details)
export const pricingPageApiCall = id =>
  axiosInstance.get(`/center/onboarding/temp/${id}`)
export const gsteApiCall = id =>
  axiosInstance.get(`/center/onboarding/calculate?onboarding_id=${id}`)
export const onboardFinalizeApiCall = (details, id) =>
  axiosInstance.post(`/center/billing/onboarding/finalize/${id}`, details)

//Authentication
export const loginApiCall = details =>
  axiosInstance.post('/auth/centeradmin/login', details)
export const requestOTPforgotPasswordApiCall = details =>
  axiosInstance.post('/auth/centeradmin/forgot-password/request-otp', details)
export const verifyOTPforgotPasswordApiCall = details =>
  axiosInstance.post('/auth/centeradmin/forgot-password/verify-otp', details)
export const resetPasswordApiCall = details => {
  return axiosInstance.post(
    '/auth/centeradmin/forgot-password/set-password',
    details
  )
}
export const createCenterAccountApiCall = details =>
  axiosInstance.post('/auth/centeradmin/change-password', details)

// EmployeeManagement
export const getEmployeeCategoriesApiCall = () =>
  axiosInstance.get('/settings/superadmin/designation')
export const CreateEmployeeCategoriesApiCall = details =>
  axiosInstance.post('/settings/superadmin/designation', details, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const UpdateEmployeeCategoriesApiCall = (details, id) =>
  axiosInstance.put(`/settings/superadmin/designation/${id}`, details, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const DeleteEmployeeCategoriesApiCall = id =>
  axiosInstance.delete(`/settings/superadmin/designation/${id}`)
export const GetEmployeeCategoriesByIdApiCall = id =>
  axiosInstance.get(`/settings/superadmin/designation/${id}`)

export const getEmployeeApiCall = data =>
  axiosInstance.get(`/auth/employee?page=${data?.page}&page_size=${10}`)
export const createEmployeeApiCall = details =>
  axiosInstance.post('/auth/employee', details)
export const updateEmployeeApiCall = (details, id) =>
  axiosInstance.put(`/auth/employee/${id}`, details)
export const deleteEmployeeApiCall = id =>
  axiosInstance.delete(`/auth/employee/${id}`)
export const GetEmployeeByIdApiCall = id =>
  axiosInstance.get(`/auth/employee/${id}`)
export const updateEmployeeStatusApiCall = (details, id) =>
  axiosInstance.patch(
    `/auth/employee/${id}/status?status=${details.status}`,
    details
  )
export const deleteMultipleEmployeeApiCall = details =>
  axiosInstance.post('/auth/employee/delete-multiple', details)

// TAX API
export const getTaxApiCall = () =>
  axiosInstance.get(`/settings/superadmin/tax-categories/`)
export const createTaxApiCall = details =>
  axiosInstance.post('/settings/superadmin/tax-categories/', details)
export const updateTaxApiCall = (details, id) =>
  axiosInstance.put(`/settings/superadmin/tax-categories/${id}`, details)
export const deleteTaxApiCall = id =>
  axiosInstance.delete(`/settings/superadmin/tax-categories/${id}`)
export const getTaxByIdApiCall = id =>
  axiosInstance.get(`/settings/superadmin/tax-categories/${id}`)

//SLOT CREATION API
export const getSlotApiCall = () =>
  axiosInstance.get(`/center/center/time-slots`)
export const createSlotApiCall = details =>
  axiosInstance.post('/center/center/time-slots', details)
export const deleteSlotApiCall = id =>
  axiosInstance.delete(`/center/center/time-slots/${id}`)

//CENTER TIMING API
export const getCenterTimeApiCall = () =>
  axiosInstance.get(`/settings/superadmin/center-operational-settings/`)
export const createCenterTimeApiCall = details =>
  axiosInstance.post(
    '/settings/superadmin/center-operational-settings/',
    details
  )
export const deleteCenterTimeApiCall = id =>
  axiosInstance.delete(`/settings/superadmin/center-operational-settings/${id}`)
export const updateCenterTimeApiCall = details =>
  axiosInstance.put(
    `/settings/superadmin/center-operational-settings/`,
    details
  )

//MEMBERSHIP PLAN API
export const getMembershipPlanApiCall = status =>
  axiosInstance.get(
    `/membership/memberships-plans${status == 'All' ? '' : `?status=${status}`}`
  )
export const createMembershipPlanApiCall = details =>
  axiosInstance.post('/membership/memberships-plans', details)
export const deleteMembershipPlanApiCall = id =>
  axiosInstance.delete(`/membership/memberships-plans/${id}`)
export const updateMembershipPlanApiCall = (details, id) =>
  axiosInstance.put(`/membership/memberships-plans/${id}`, details)
export const getMembershipPlanByIdApiCall = id =>
  axiosInstance.get(`/membership/memberships-plans/${id}`)
export const updateMembershipStatusApiCall = (details, id) =>
  axiosInstance.patch(
    `/membership/memberships-plans/${id}/status?status=${details.status}`,
    details
  )

//HOLIDAY API
export const getHolidayApiCall = () =>
  axiosInstance.get(`/settings/superadmin/center-holidays/`)
export const createHolidayApiCall = details =>
  axiosInstance.post('/settings/superadmin/center-holidays/', details)
export const deleteHolidayApiCall = id =>
  axiosInstance.delete(`/settings/superadmin/center-holidays/${id}`)

// NETWORK API
export const addNetworkAmountApiCall = amount =>
  axiosInstance.put('/networking/center/networking-amount', null, {
    params: { amount }
  })
export const networkToggleButtonApiCall = enabled =>
  axiosInstance.put('/networking/center/networking/toggle', { enabled })
export const getNetworkToggleStatusApiCall = () =>
  axiosInstance.get('/networking/center/network-enabled/me')
export const getUserNetworkListApiCall = data => {
  return axiosInstance.get(`/networking/networking/bookings?page=${data?.page}`)
}
export const editApproveNetworkApiCall = id =>
  axiosInstance.put(`/networking/networking/access/approve`, null, {
    params: { network_membership_id: id }
  })
export const getNetworkingBookingByIdApiCall = id =>
  axiosInstance.get(`/networking/networking/booking/${id}`)
export const deleteNetworkBookingApiCall = id =>
  axiosInstance.delete(`/networking/networking/booking/${id}`)

// Wallet
export const createWalletApiCall = details =>
  axiosInstance.post('/center/center/wallet/create', details)
export const getWalletsummaryApiCall = () =>
  axiosInstance.get('/center/center/wallet/summary')
export const getWalletTransactionsApiCall = (details = {}) => {
  return axiosInstance.get(`/center/center/wallet/transactions`, {
    params: {
      page: details.page ?? 1,
      page_size: details.page_size ?? 10,
      type: details.type ?? '',
      transaction_type: details.transaction_type ?? '',
      status: details.status ?? '',
      start_date: details.start_date ?? '',
      end_date: details.end_date ?? ''
    }
  })
}
export const getWalletAmountApiCall = () =>
  axiosInstance.get('/center/center/wallet')

//ATTENDANCE API
export const getAllEmployeesApiCall = () =>
  axiosInstance.get(`auth/centeradmin/employees`)
export const createAttendanceApiCall = details =>
  axiosInstance.post('/attendance/centeradmin/attendance/add', details)
export const getAllMemberAttendanceApiCall = data => {
  const params = {
    page: data?.page || 1,
    page_size: data?.pageSize || 10,
    role: 'member'
  }
  if (data?.from) {
    params.date_from = data.from
  }
  if (data?.to) {
    params.date_to = data.to
  }
  return axiosInstance.get('attendance/centeradmin/attendance/list', { params })
}
export const getAllEmployeeAttendanceApiCall = data => {
  const params = {
    page: data?.page || 1,
    page_size: data?.pageSize || 10,
    role: 'employee'
  }
  if (data?.categoryId) {
    params.employee_designation = data.categoryId
  }
  if (data?.from) {
    params.date_from = data.from
  }
  if (data?.to) {
    params.date_to = data.to
  }
  return axiosInstance.get('attendance/centeradmin/attendance/list', { params })
}
export const deleteAttendanceApiCall = id =>
  axiosInstance.delete(`/attendance/centeradmin/attendance/${id}`)

// BRANCH API
export const addBranchCountApiCall = details =>
  axiosInstance.post('/branching/centeradmin/branch/request', details)
export const getBranchPricesAndTaxApiCall = () =>
  axiosInstance.get('/branching/centeradmin/branch/request/summary')
export const getPurchasedBranchesApiCall = () =>
  axiosInstance.get(`/branching/centeradmin/branch/purchased`)
export const getBranchCategoriesListApiCall = () =>
  axiosInstance.get('/settings/superadmin/center-categories/')
export const createNewBranchDetailsApiCall = ({ param, data }) => {
  console.log('FormData', data)
  console.log('Param', param)
  return axiosInstance.post(
    `/branching/centeradmin/branch/create?payment_order_id=${param}`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

//GALLERY API
export const getGalleryApiCall = id =>
  axiosInstance.get(`/center/center/${id}/gallery`)
export const createGalleryApiCall = details =>
  axiosInstance.post(`/center/center/gallery`, details, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const deleteGalleryApiCall = id => {
  console.log('idaaaaaaa', id)
  return axiosInstance.delete(`/center/center/gallery/${id}`)
}

//BRANDING API
export const getBrandingApiCall = id =>
  axiosInstance.get(`/branding/branding/white-label/all`)
export const createBrandingApiCall = details =>
  axiosInstance.post(`/branding/branding/white-label/bulk-update`, details)

//CENTER PROFILE API
export const getCenterProfileApiCall = () =>
  axiosInstance.get(`/branching/centeradmin/branches/list-summary`)
export const updateCenterProfileApiCall = (details, id) =>
  axiosInstance.put(`/center/center/profile/update/${id}`, details)
export const getCenterProfileByIdApiCall = id =>
  axiosInstance.get(`/center/center/${id}/by-id`)

export const updateCenterProfilePicApiCall = details =>
  axiosInstance.put(`/center/centeradmin/profile-photo`, details, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }) // For updating profile photo in the center profile section
export const updateCentersProfileImageApiCall = details =>
  axiosInstance.put(`/center/center/image/update`, details, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }) // For updating centers and sub-branchs image from center information page
export const getCenterProfileInfoApiCall = () =>
  axiosInstance.get(`/center/centeradmin/profile`)

//CRM API
export const getMemberApiCall = data =>
  axiosInstance.get(`/membership/center/members?page=${data?.page}`)
export const createMemberApiCall = details =>
  axiosInstance.post('/membership/center/members', details)
export const updateMemberApiCall = (details, id) =>
  axiosInstance.patch(`/membership/center/members/${id}`, details)
export const getMemberByIdApiCall = id =>
  axiosInstance.get(`/membership/center/members/${id}`)
export const deleteMemberApiCall = id =>
  axiosInstance.delete(`/membership/center/members/${id}`)
export const getMemberTimeSlotApiCall = id =>
  axiosInstance.get(`/membership/center/time-slots?center_id=${id}`)
export const getMemberPlanApiCall = () =>
  axiosInstance.get(`/membership/memberships-plans-mini`)
export const getMemberCountApiCall = () =>
  axiosInstance.get(`/membership/center/member-counts`)
export const updateMemberStatusApiCall = (id, status) =>
  axiosInstance.patch(
    `/membership/center/members/${id}/status?status=${status}`
  )

export const getVisitorApiCall = data =>
  axiosInstance.get(`/membership/center/visitors?page=${data?.page}`)
