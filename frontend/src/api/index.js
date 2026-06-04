import axiosInstance from './axiosInstance'

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
  axiosInstance.get(`/auth/employee?page=${data?.page}&page_size=${10}&search=${data?.search || ''}`)
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

export const getPayrollApiCall = data =>
  axiosInstance.get(`/payrole/payroll/history?page=${data?.page || 1}`)
export const runPayrollApiCall = details =>
  axiosInstance.post('/payrole/payroll/run', details)

export const getPayCycleApiCall = data =>
  axiosInstance.get(`/payrole/payroll-cycle/`)
export const createPayCycleApiCall = details =>
  axiosInstance.post('/payrole/payroll-cycle/', details)

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
export const getEmployeesDropdownApiCall = () =>
  axiosInstance.get(`auth/employees/mini`)