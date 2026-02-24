import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import AuthHeader from './components/AuthHeader'
import { useState } from 'react'
import { useRequestOTPforgotPasswordMutation } from '@api-queries/authentication/Query'
import { useNavigate } from 'react-router-dom'


const ForgetPassord = () => {
  const [email, setEmail] = useState("")
  const { mutate, isPending } = useRequestOTPforgotPasswordMutation()
  const navigate = useNavigate()



  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      mutate(
        { email },   
        {
          onSuccess: (data) => {
            // console.log("OTP sent:", data)
            navigate('/otp-verification',
              // {
              //   state: { email }  
              // }
            )
          },
          onError: (error) => {
            console.error("Error sending OTP", error)
          }
        }
      )
    } catch (err) {
      console.log("Error at the ForgotPassword send Email..!", err);

    }
  }

  return (
    <AuthHeader
      title='Forget Password'
      description='Don’t worry! it occurs. Please enter the email address linked with your account.'
    >
      <form action='' onSubmit={handleSubmit} className='space-y-4'>
        <Input
          label='Email ID'
          name='email'
          placeholder='Enter Your Email ID'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button variant='button_filled' size='sm' className='w-full mt-4' disabled={isPending}>
          Send Code
        </Button>
      </form>
    </AuthHeader>
  )
}
export default ForgetPassord
