import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/PasswordInput'
import googleicon from '@assets/form-icons/google.svg'
import AuthHeader from './components/AuthHeader'

const PrimaryLogin = () => {
  return (
    <AuthHeader title='Create Account' description=''>
      <form action='' className='space-y-3'>
        <Input
          label='Email ID'
          name='email'
          placeholder='Enter Your Email ID'
        />
        <PasswordInput
          label='Create Password'
          name='center_name'
          placeholder='Create Password'
          iconPosition='end'
        />
        <PasswordInput
          label='Confirm Password'
          name='center_name'
          placeholder='Confirm Password'
          iconPosition='end'
        />
        <Button variant='button_filled' size='sm' className='w-full mt-4'>
          Log in
        </Button>
        <div className='flex items-center w-full mt-4'>
          <div className='flex-1 h-px bg-gray-300'></div>
          <span className='px-4 text-textblack text-sm font-poppins'>
            or Sign in with
          </span>
          <div className='flex-1 h-px bg-gray-300'></div>
        </div>

        <Button
          variant='button_filled'
          size='googlebutton'
          className='w-full mt-4'
          leftIcon={googleicon}
        >
          Sign in with Google
        </Button>
      </form>
    </AuthHeader>
  )
}

export default PrimaryLogin
