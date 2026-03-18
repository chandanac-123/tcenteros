import { Button } from '@pages/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import single_arrow from '@assets/navigate-icons/single-left-arrow.svg'
import OtpInput from '@common/components/OtpInput'
import AuthHeader from './components/AuthHeader'
import { useState } from 'react'
import { useVerifyOTPforgotPasswordMutation } from '@api-queries/authentication/Query'
import { showError, showSuccess } from '@utils/toast'

const OTPVerification = () => {
  const [otp, setOTP] = useState("");
  const { mutate, isPending } = useVerifyOTPforgotPasswordMutation()
  const navigate = useNavigate()



  const handleVerify = (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      alert("Please enter valid OTP")
      return
    }

    mutate(
      { otp },
      {
        onSuccess: (res) => {
        
          showSuccess("OTP Verified Successfully");
          // navigate to reset password page
          navigate("/reset-password", {
            state: { otp }   // pass OTP forward
          })
        },
        onError: (error) => {
          console.log(error.response?.data);
          const message =
            error?.response?.data?.detail ||
            "OTP Verification Failed";
          showError(message) 

        }
      }
    )
  }


  return (
    <AuthHeader
      title='OTP Verification'
      description='Enter the verification code we just sent on your email address'
    >
      <form action='' onSubmit={handleVerify} className='space-y-4'>
        <div className='flex justify-center'>
          <OtpInput maxLength={6}
            value={otp}
            onChange={(e) => setOTP(e)}
          />
        </div>

        <Button variant='button_filled' size='sm' className='w-full mt-4'>
          Verify
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

export default OTPVerification
