import { Button } from '@pages/components/ui/button'
import PasswordInput from '@common/components/PasswordInput'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthHeader from './components/AuthHeader'
import { useFormik } from 'formik'
import { emailResetPasswordValidationSchema } from '@utils/validations'
import { useEmailResetPasswordMutation } from '@api-queries/center-admin/authentication/Query'

const EmailResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const tokenKey = searchParams.get("token");
  console.log('tokenKey: ', tokenKey);
  const { mutateAsync: reset_password, isPending } =
    useEmailResetPasswordMutation();

  const formik = useFormik({
    initialValues: {
      token: tokenKey || "",
      password: "",
      confirm_password: "",
    },
    validationSchema: emailResetPasswordValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log('values: ', values);
      try {
        await reset_password(values);
        navigate("/dashboard");
      } catch (error) {
        console.error("Error resetting password:", error.response);
      }
    },
  });

  return (
    <AuthHeader
      title='Create Password'
      description='Create a new password to secure your account.'
    >
      <form action='' onSubmit={formik.handleSubmit} className='space-y-4'>
        <PasswordInput
          label='Create Password'
          name='password'
          placeholder='Create Password'
          iconPosition='end'
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && formik.errors.password}
        />
        <PasswordInput
          label='Confirm New Password'
          name='confirm_password'
          placeholder='Confirm New Password'
          iconPosition='end'
          value={formik.values.confirm_password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirm_password && formik.errors.confirm_password}
        />

        <Button variant='button_filled' size='sm' type='submit' className='w-full mt-4'>
          Submit
        </Button>

      </form>
    </AuthHeader>
  )
}

export default EmailResetPassword
