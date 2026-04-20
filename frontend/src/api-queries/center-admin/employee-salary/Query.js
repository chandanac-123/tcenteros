import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSalary,
  deleteSalary,
  getAllSalaries,
  getSalaryById,
  updateSalary
} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllSalariesQuery = (data) => {
  return useQuery({
    queryKey: ['salary', data],
    queryFn: () => getAllSalaries(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
export const useCreateSalaryMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createSalary(data),
    onSuccess: async data => {
      query.invalidateQueries('salary')
      showSuccess('Salary created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create salary')
      return err
    }
  })
}

export const useUpdateSalaryMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateSalary(data, id),
    onSuccess: async data => {
      query.invalidateQueries('salary')
      showSuccess('Salary updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to update salary')
      return err
    }
  })
}

export const useDeleteSalaryMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteSalary(id),
    onSuccess: async data => {
      query.invalidateQueries('salary')
      showSuccess(data.detail || 'Salary deleted successfully')
    },
    onError: err => {
      showError(
        err?.response?.data?.message || 'Failed to delete selected salaries'
      )
      return err
    }
  })
}

export const useSalaryGetByIdQuery = id => {
  return useQuery({
    queryKey: ['salary', id],
    queryFn: () => getSalaryById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
