import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/components/PasswordInput'
import { Link, useNavigate } from 'react-router-dom'
import single_arrow from '@assets/navigate-icons/single-left-arrow.svg'
import AuthHeader from './components/AuthHeader'
import { useState } from 'react'
import { useResetPasswordMutation } from '@api-queries/authentication/Query'
import { toast } from 'sonner'
import { showError, showSuccess, showWarning } from '@utils/toast'

const ResetPassword = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()


  const { mutate, isPending } = useResetPasswordMutation()

  const handleResetPassword = (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      showWarning("Please fill the fields");
      return
    }

    if (password !== confirmPassword) {
     showWarning("Password not match");
      return
    }

    mutate(
      {
        password,
        confirm_password: confirmPassword
      },
      {
        onSuccess: () => {
          showSuccess("Password reset successful");
          navigate("/reset-success")
        },
        onError: () => {
          showError("Password reset Failed");
        }
      }
    )
  }

  return (
    <AuthHeader
      title='Create Password'
      description='Your new password must be unique from those previously used.'
    >
      <form action='' onSubmit={handleResetPassword} className='space-y-4'>
        <PasswordInput
          label='Create Password'
          name='center_name'
          placeholder='Create Password'
          iconPosition='end'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          label='Confirm New Password'
          name='center_name'
          placeholder='Confirm New Password'
          iconPosition='end'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button variant='button_filled' size='sm' className='w-full mt-4'>
          Submit
        </Button>
        <div className='flex justify-center'>
          <Link to='/forgot-password' className='text-sm text-pricing_text'>
            <img
              src={single_arrow}
              alt='Go Back'
              className='inline-block mr-2 w-3'
            />
            Go Back
          </Link>
        </div>
      </form>
    </AuthHeader>
  )
}

export default ResetPassword
