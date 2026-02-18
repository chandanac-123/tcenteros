import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/PasswordInput'
import AuthHeader from './components/AuthHeader'

const PrimaryLogin = () => {
  return (
    <AuthHeader title='Create Account' description=''>
      <form action='' className='space-y-4'>
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
      </form>
    </AuthHeader>
  )
}

export default PrimaryLogin
