import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAttendance,
  getAllEmployeeAttendance,
  getAllEmployees,
  getAllMemberAttendance,
  deleteAttendance
} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllEmployeesQuery = () => {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: getAllEmployees,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateAttendanceMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createAttendance(data),
    onSuccess: async data => {
      query.invalidateQueries('attendance')
      showSuccess('Attendance created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create attendance')
      return err
    }
  })
}

export const useAllMemberAttendanceQuery = data => {
  return useQuery({
    queryKey: ['member-attendance', data], // 🔥 include data in key
    queryFn: () => getAllMemberAttendance(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useAllEmployeesAttendanceQuery = (data) => {
  return useQuery({
    queryKey: ['employee-attendance', data],
    queryFn: () => getAllEmployeeAttendance(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}


export const useDeleteAttendanceMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteAttendance(id),
    onSuccess: async data => {
      query.invalidateQueries('attendance')
      showSuccess('Attendance record deleted successfully')
    },
    onError: err => {
      showError(
        err?.response?.data?.message || 'Failed to delete attendance record'
      )
      return err
    }
  })
}
