import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  createEmployee,
  deleteEmployee,
  getAllCategories,
  getAllEmployees,
  updateEmployee
} from './Urls'

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateCategoryMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createCategory(data),
    onSuccess: async data => {
      query.invalidateQueries('categories')
    },
    onError: err => {
      return err
    }
  })
}

export const useEmployeeQuery = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => getAllEmployees(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateEmployeeMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createEmployee(data),
    onSuccess: async data => {
      query.invalidateQueries('employees')
    },
    onError: err => {
      return err
    }
  })
}

export const useUpdateEmployeeMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateEmployee(data, id),
    onSuccess: async data => {
      query.invalidateQueries('employees')
    },
    onError: err => {
      return err
    }
  })
}

export const useDeleteEmployeeMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteEmployee(id),
    onSuccess: async data => {
      query.invalidateQueries('employees')
    },
    onError: err => {
      return err
    }
  })
}
