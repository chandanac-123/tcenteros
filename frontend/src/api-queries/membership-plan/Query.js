import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPlan,
  deletePlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  updateStatusPlan
} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const usePlansQuery = (status) => {
  return useQuery({
    queryKey: ['plans', status],
    queryFn: () => getAllPlans(status),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreatePlanMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createPlan(data),
    onSuccess: async data => {
      query.invalidateQueries('plans')
      showSuccess('Plan created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create plan')
      return err
    }
  })
}

export const useUpdatePlanMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updatePlan(data, id),
    onSuccess: async data => {
      query.invalidateQueries('plans')
      showSuccess('Plan updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to update plan')
      return err
    }
  })
}

export const useDeletePlanMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deletePlan(id),
    onSuccess: async data => {
      query.invalidateQueries('plans')
      showSuccess('Plan deleted successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to delete plan')
      return err
    }
  })
}

export const usePlanGetByIdQuery = id => {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: () => getPlanById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useUpdatePlanStatusMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateStatusPlan(data, id),
    onSuccess: async data => {
      console.log('data: ', data.detail );
      query.invalidateQueries({ queryKey: ['plans'] })
      showSuccess(data.detail || 'Plan status updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to update plan')
      return err
    }
  })
}