import { Button } from '@pages/components/ui/button'
import { Link } from 'react-router-dom'
import single_arrow from '@assets/navigate-icons/single-left-arrow.svg'
import OtpInput from '@common/OtpInput'
import AuthHeader from './components/AuthHeader'

const OTPVerification = () => {
  return (
    <AuthHeader
      title='OTP Verification'
      description='Enter the verification code we just sent on your email address'
    >
      <form action='' className='space-y-4'>
        <div className='flex justify-center'>
          <OtpInput maxLength={6} />
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
