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
  axiosInstance.get(
    `/auth/employee?page=${data?.page}&page_size=${data?.pageSize}`
  )
export const createEmployeeApiCall = details =>
  axiosInstance.post('/auth/employee', details)
export const updateEmployeeApiCall = (details, id) =>
  axiosInstance.put(`/auth/employee/${id}`, details)
export const deleteEmployeeApiCall = id =>
  axiosInstance.delete(`/auth/employee/${id}`)
export const GetEmployeeByIdApiCall = id =>
  axiosInstance.get(`/auth/employee/${id}`)

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
export const updateCenterTimeApiCall = (details, id) =>
  axiosInstance.put(
    `/settings/superadmin/center-operational-settings/${id}`,
    details
  )

//MEMBERSHIP PLAN API
export const getMembershipPlanApiCall = () =>
  axiosInstance.get(`/membership/memberships-plans`)
export const createMembershipPlanApiCall = details =>
  axiosInstance.post('/membership/memberships-plans', details)
export const deleteMembershipPlanApiCall = id =>
  axiosInstance.delete(`/membership/memberships-plans/${id}`)
export const updateMembershipPlanApiCall = (details, id) =>
  axiosInstance.put(`/membership/memberships-plans/${id}`, details)
export const getMembershipPlanByIdApiCall = id =>
  axiosInstance.get(`/membership/memberships-plans/${id}`)

//HOLIDAY API
export const getHolidayApiCall = () =>
  axiosInstance.get(`/settings/superadmin/center-holidays/`)
export const createHolidayApiCall = details =>
  axiosInstance.post('/settings/superadmin/center-holidays/', details)
export const deleteHolidayApiCall = id =>
  axiosInstance.delete(`/settings/superadmin/center-holidays/${id}`)

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
