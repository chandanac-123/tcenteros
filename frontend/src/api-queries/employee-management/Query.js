import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  createEmployee,
  deleteCategory,
  deleteEmployee,
  getAllCategories,
  getAllEmployees,
  updateEmployee,
  getCategoryById,
  updateCategory,
  getEmployeeById,
  updateEmployeeStatus,
  deleteMultipleEmployees
} from './Urls'
import { showError, showSuccess } from '@utils/toast'

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
      showSuccess('Category created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create category')
      return err
    }
  })
}

export const useUpdateCategoryMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(data, id),
    onSuccess: async data => {
      query.invalidateQueries('categories')
      showSuccess('Category updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to update category')
      return err
    }
  })
}

export const useDeleteCategoryMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteCategory(id),
    onSuccess: async data => {
      query.invalidateQueries('categories')
      showSuccess('Category deleted successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to delete category')
      return err
    }
  })
}

export const useCategoriesGetByIdQuery = id => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useEmployeeQuery = data => {
  return useQuery({
    queryKey: ['employees', data],
    queryFn: () => getAllEmployees(data),
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
      showSuccess('Employee created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.detail || 'Failed to create employee')
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
      showSuccess('Employee updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.detail || 'Failed to update employee')
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
      showSuccess('Employee deleted successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to delete employee')
      return err
    }
  })
}

export const useEmployeeGetByIdQuery = id => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployeeById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useUpdateEmployeeStatusMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateEmployeeStatus(data, id),
    onSuccess: async data => {
      query.invalidateQueries('employees')
      showSuccess(data.detail || 'Plan status updated successfully')
    },
    onError: err => {
      showError(
        err?.response?.data?.message || 'Failed to update employee status'
      )
      return err
    }
  })
}

export const useDeleteMultipleEmployeeMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: details => deleteMultipleEmployees(details),
    onSuccess: async data => {
      query.invalidateQueries('employees')
      showSuccess('Selected employees deleted successfully')
    },
    onError: err => {
      showError(
        err?.response?.data?.message || 'Failed to delete selected employees'
      )
      return err
    }
  })
}
