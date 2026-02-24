import { useAuthStore } from '@store/authStore'
import { login, requestOTPforgotPassword, resetPassword, verifyOTPforgotPassword } from './Urls'
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


export const useRequestOTPforgotPasswordMutation = () => {
  return useMutation({
    mutationFn: requestOTPforgotPassword
  })
}

export const useResetPasswordMutation = () => {
  const query=useQueryClient()
  return useMutation({
    mutationFn: resetPassword,
    onSuccess:()=>{
      query.invalidateQueries({ queryKey: ['auth'] })
    }
  })
}

export const useVerifyOTPforgotPasswordMutation = () => {
  const query=useQueryClient()
  return useMutation({
    mutationFn: verifyOTPforgotPassword,
     onSuccess:()=>{
      query.invalidateQueries({ queryKey: ['auth'] })
    }
  })
}
