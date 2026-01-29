import * as Yup from 'yup'

export const onboardingValidationSchema = Yup.object().shape({
  center_name: Yup.string().required('Center name is required'),
  contact_person: Yup.string().required('Contact person name is required'),
  center_email: Yup.string()
    .email('Invalid email')
    .required('Contact email is required'),
  center_phone: Yup.string()
    .matches(/^[0-9]{10,12}$/, 'Invalid phone number')
    .required('Contact phone is required'),
  city: Yup.string().required('City is required'),
  is_terms_and_conditions: Yup.boolean().oneOf(
    [true],
    'You must accept the terms'
  )
})
