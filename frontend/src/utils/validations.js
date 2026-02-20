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

export const employeeValidationSchema = Yup.object().shape({
  full_name: Yup.string().required('Enter full name'),
  email: Yup.string().required('Enter email'),
  mobile: Yup.string().required('Enter mobile number'),
  password: Yup.string().required('Enter password'),
  designation_id: Yup.string().required('Enter designation category')
})

export const membershipValidationSchema = Yup.object().shape({
  membership_name: Yup.string()
    .required('Membership name is required')
    .min(2, 'Name must be at least 2 characters'),
  duration_count: Yup.number()
    .required('Duration count is required')
    .positive('Duration must be positive')
    .integer('Duration must be a whole number'),
  duration_unit: Yup.string().required('Duration unit is required'),
  default_price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  membership_features: Yup.array()
    .of(Yup.string().min(1, 'Feature cannot be empty'))
    .min(1, 'Add at least one feature')
})

export const holidayValidationSchema = Yup.object().shape({
  holiday_name: Yup.string().required('Enter holiday name'),
  start_date: Yup.string().required('Enter start date'),
  end_date: Yup.string().required('Enter end date')
})

export const attendanceValidationSchema = Yup.object().shape({
  employee_id: Yup.string().required('Select full name'),
  date: Yup.string().required('Enter date'),
  check_in_time: Yup.string().required('Enter check-in time'),
  check_out_time: Yup.string().required('Enter check-out time'),
})