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

export const invoiceValidationSchema = Yup.object().shape({
  address_line_1: Yup.string().required('Enter address'),
  address_line_2: Yup.string().required('Enter pincode')
})

export const categoryValidationSchema = Yup.object().shape({
  name: Yup.string().required('Enter Designation'),
  image_url: Yup.mixed()
    .nullable()
    .required('Upload an image')
    .test(
      'fileType',
      'Only JPG, JPEG, PNG files are allowed',
      value =>
        !value || ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)
    )
    .test(
      'fileSize',
      'Image size must be less than 2MB',
      value => !value || value.size <= 2 * 1024 * 1024
    )
})
