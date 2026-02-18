import { useAuthStore } from '@store/authStore'
import { login } from './Urls'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useLoginMutation = () => {
  const query = useQueryClient()
  const setAuth = useAuthStore(state => state.setAuth)
  return useMutation({
    mutationFn: login,
    onSuccess: data => {
      setAuth(data)
      query.invalidateQueries({ queryKey: ['auth'] })
    }
  })
}
