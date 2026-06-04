import { useAuthStore } from '@store/authStore'
import { createCenterAccount, emailResetPassword, login, requestOTPforgotPassword, resetPassword, verifyOTPforgotPassword } from './Urls'
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


export const useRequestOTPforgotPasswordMutation = () => {
  return useMutation({
    mutationFn: requestOTPforgotPassword,
    onSuccess: data => {
      showSuccess(data?.detail)
    },
    onError: error => {
      const message =
        error?.response?.data?.detail
      showError(message)
      throw new Error(message)
    }
  })
}

export const useResetPasswordMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      showSuccess(data?.detail)
      query.invalidateQueries({ queryKey: ['auth'] })
    }
  })
}

export const useVerifyOTPforgotPasswordMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: verifyOTPforgotPassword,
    onSuccess: (data) => {
      showSuccess(data?.detail)
      query.invalidateQueries({ queryKey: ['auth'] })
    }
  })
}

export const useCreateCenterAccountMutation = () => {
  const query = useQueryClient()
  const setAuth = useAuthStore(state => state.setAuth)
  return useMutation({
    mutationFn: createCenterAccount,
    onSuccess: (data) => {
      console.log("Data Token", data);
      setAuth(data, true)
      query.invalidateQueries({ queryKey: ['auth'] })
    }
  })
}

export const useEmailResetPasswordMutation = () => {
  const query = useQueryClient()
  const setAuth = useAuthStore(state => state.setAuth)
  return useMutation({
    mutationFn: emailResetPassword,
    onSuccess: (data) => {
      setAuth(data, true)
      query.invalidateQueries({ queryKey: ['auth'] })
    }
  })
}
