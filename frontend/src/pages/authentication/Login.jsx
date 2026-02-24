import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/PasswordInput'
import { Link, useNavigate } from 'react-router-dom'
import AuthHeader from './components/AuthHeader'
import { useState } from 'react'
import { useLoginMutation } from '@api-queries/authentication/Query'

const Login = () => {
  const { mutateAsync: login, isPending } = useLoginMutation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
    }
  }

  return (
    <AuthHeader title='Welcome Back' description=''>
      <form className='space-y-3' onSubmit={handleSubmit}>
        <Input
          label='Email ID'
          name='email'
          placeholder='Enter Your Email ID'
          value={form.email}
          onChange={handleChange}
          disabled={isPending}
        />
        <PasswordInput
          label='Password'
          name='password'
          placeholder='Enter Password'
          iconPosition='end'
          value={form.password}
          onChange={handleChange}
          disabled={isPending}
        />
        <div className='flex justify-end'>
          <Link
            to='/forgot-password'
            className='text-sm text-secondary hover:underline'
          >
            Forgot Password?
          </Link>
        </div>

        <div className='mt4'>
          <Button
            variant='button_filled'
            size='sm'
            className='w-full mt-4'
            type='submit'
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Log in'}
          </Button>
        </div>
      </form>
    </AuthHeader>
  )
}

export default Login
