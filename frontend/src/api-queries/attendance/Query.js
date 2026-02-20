import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAttendance, getAllEmployees } from './Urls'
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
