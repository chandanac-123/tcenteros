import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPermission, getAllPermission } from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const usePermissionQuery = () => {
  return useQuery({
    queryKey: ['tax'],
    queryFn: getAllPermission,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
export const useCreatePermissionMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createPermission(data),
    onSuccess: async data => {
      query.invalidateQueries('tax')
      showSuccess('Permission set successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create Permission')
      return err
    }
  })
}
