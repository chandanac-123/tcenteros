import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/PasswordInput'
import googleicon from '@assets/form-icons/google.svg'
import { Switch } from '@pages/components/ui/switch'
import { Link } from 'react-router-dom'
import AuthHeader from './components/AuthHeader'

const Login = () => {
  return (
    <AuthHeader title='Welcome Back' description=''>
      <form action='' className='space-y-3'>
        <Input
          label='Email ID'
          name='email'
          placeholder='Enter Your Email ID'
        />
        <PasswordInput
          label='Password'
          name='password'
          placeholder='Enter Password'
          iconPosition='end'
        />

        <div className='flex justify-between'>
          <div className='flex items-center gap-2'>
            <Switch />
            Remember me
          </div>
          <Link
            to='/forgot-password'
            className='text-sm text-secondary hover:underline'
          >
            Forgot Password?
          </Link>
        </div>

        <div className='mt4'>
          <Button variant='button_filled' size='sm' className='w-full mt-4'>
            Log in
          </Button>
          <div className='flex items-center w-full mt-4'>
            <div className='flex-1 h-px bg-gray-300'></div>
            <span className='px-4 text-textblack text-sm font-poppins'>
              or Log in with
            </span>
            <div className='flex-1 h-px bg-gray-300'></div>
          </div>

          <Button
            variant='button_filled'
            size='googlebutton'
            className='w-full mt-4'
            leftIcon={googleicon}
          >
            Log in with Google
          </Button>
        </div>
      </form>
    </AuthHeader>
  )
}

export default Login
