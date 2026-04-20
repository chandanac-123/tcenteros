import axiosInstance from "@api/axiosInstance"

export const getSalaryApiCall = data =>
  axiosInstance.get(
    `/payrole/center/employees/salary-structure?page=${data?.page}`
  )
export const createSalaryApiCall = details =>
  axiosInstance.post('/payrole/payrole/employee-salary', details)
export const updateSalaryApiCall = (details, id) =>
  axiosInstance.put(`/payrole/center/employees/${id}/salary-structure`, details)
export const deleteSalaryApiCall = id =>
  axiosInstance.delete(`/payrole/center/employees/${id}/salary-structure`)
export const getSalaryByIdApiCall = id =>
  axiosInstance.get(`/payrole/center/employees/${id}/salary-structure`)