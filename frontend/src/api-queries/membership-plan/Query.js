import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPlan,
  deletePlan,
  getAllPlans,
  getPlanById,
  updatePlan
} from './Urls'

export const usePlansQuery = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => getAllPlans(),
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
    },
    onError: err => {
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
    },
    onError: err => {
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
    },
    onError: err => {
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
