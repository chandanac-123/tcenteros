import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/PasswordInput'
import { Link } from 'react-router-dom'
import single_arrow from '@assets/navigate-icons/single-left-arrow.svg'
import AuthHeader from './components/AuthHeader'

const ResetPassword = () => {
  return (
    <AuthHeader
      title='Create Password'
      description='Your new password must be unique from those previously used.'
    >
      <form action='' className='space-y-4'>
        <PasswordInput
          label='Create Password'
          name='center_name'
          placeholder='Create Password'
          iconPosition='end'
        />
        <PasswordInput
          label='Confirm New Password'
          name='center_name'
          placeholder='Confirm New Password'
          iconPosition='end'
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
