import { useAuthStore } from '@store/authStore'
import { login } from './Urls'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { showError, showSuccess } from '@utils/toast'

export const useLoginMutation = () => {
  const query = useQueryClient()
  const setAuth = useAuthStore(state => state.setAuth)
  return useMutation({
    mutationFn: login,
    onSuccess: data => {
      setAuth(data)
      query.invalidateQueries({ queryKey: ['auth'] })
      showSuccess('Login successful')
    },
    onError: error => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        'Invalid credentials'
      showError(message)
      throw new Error(message)
    }
  })
}
