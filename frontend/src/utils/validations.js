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
  subscription_duration: Yup.string().required(
    'Subscription duration is required'
  ),
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
  name: Yup.string().required('Enter Designation')
})

export const employeeValidationSchema = isEdit =>
  Yup.object().shape({
    full_name: Yup.string().required('Full name is required'),
    email: Yup.string().email().required('Email is required'),
    mobile: Yup.string().required('Mobile is required'),
    designation_id: isEdit
      ? Yup.string()
      : Yup.string().required('Designation is required'),
    password: isEdit
      ? Yup.string()
      : Yup.string().required('Password is required'),
    profile_photo: isEdit
      ? Yup.mixed()
      : Yup.mixed().required('Image is required'),
    joining_date: isEdit
      ? Yup.string()
      : Yup.string().required('Joining date is required')
  })

export const membershipValidationSchema = Yup.object().shape({
  membership_name: Yup.string()
    .required('Membership name is required')
    .min(2, 'Name must be at least 2 characters'),
  duration_count: Yup.number()
    .required('Duration required')
    .positive('Duration must be positive')
    .integer('Duration must be a whole number'),
  default_price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive'),
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
  check_out_time: Yup.string().required('Enter check-out time')
})

export const branchValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Branch name must be at least 3 characters')
    .max(50, 'Branch name is too long')
    .required('Enter branch name'),
  center_category_id: Yup.string().required('Select center category'),
  address_line_1: Yup.string()
    .min(5, 'Address is too short')
    .required('Enter address line 1'),
  address_line_2: Yup.string()
    .min(5, 'Address is too short')
    .required('Enter address line 2'),
  center_email: Yup.string()
    .email('Invalid email format')
    .required('Enter branch email'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Create password'),
  center_phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Enter phone number'),

  center_image: Yup.mixed()
    .required('Upload profile picture')
    .test(
      'fileType',
      'Unsupported file format',
      value =>
        !value ||
        ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(
          value.type
        )
    ),
  country: Yup.string().required('Select country'),
  state: Yup.string().required('Select state'),
  city: Yup.string().required('Select city'),
  district: Yup.string().required('Select district'),
  postal_code: Yup.string().required('Enter postal code')
})

export const brandingValidationSchema = Yup.object({
  primary_color: Yup.string().required('Primary color is required'),
  secondary_color: Yup.string().required('Secondary color is required'),
  app_logo: Yup.mixed()
    .nullable()
    .required('Upload an image')
    .test('file-or-url', 'Logo is required', function (value) {
      if (!value) return false
      // If it's a File object
      if (value instanceof File) return true
      // If it's existing URL string
      if (typeof value === 'string') return true
      return false
    })
    .test(
      'fileSize',
      'Image size must be less than 2MB',
      value => !value || value.size <= 2 * 1024 * 1024
    )
})

export const galleryImageValidationSchema = Yup.object().shape({
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

export const imageValidation = Yup.mixed()
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

export const salaryValidationSchema = Yup.object().shape({
  employee_id: Yup.string().required('Select employee'),
  salary: Yup.number().required('Enter salary'),
  salary_type: Yup.string().required('Select salary type'),
  pay_cycle: Yup.string().required('Select pay cycle')
})

export const memberValidationSchema = (isEdit = false) =>
  Yup.object().shape({
    full_name: Yup.string()
      .trim()
      .required('Full name is required')
      .min(3, 'Name must be at least 3 characters'),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, 'Enter a valid 10 digit mobile number')
      .required('Mobile number is required'),
    date_of_birth: Yup.string().nullable().required('Date of birth is required'),
    membership_id: isEdit
      ? Yup.string().nullable().notRequired() // optional for edit
      : Yup.string().required('Please select a membership plan'), // required for create
    time_slot_id: Yup.string().required('Please select a time slot'),
    payment_method: isEdit
      ? Yup.string().nullable().notRequired()
      : Yup.string().when('payment_status', {
          is: 'paid',
          then: schema => schema.required('Select payment method'),
          otherwise: schema => schema.nullable()
        }),
    password: isEdit
      ? Yup.string().nullable().notRequired()
      : Yup.string().when('payment_status', {
          is: 'paid',
          then: schema => schema.required('Password is required'),
          otherwise: schema => schema.notRequired()
        })
  })

export const productValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Product name is required'),
  category: Yup.string().trim().required('Category is required'),
  unit_of_measure: Yup.string().trim().required('Unit type is required'),
  base_price: Yup.number()
    .typeError('Base price must be a number')
    .required('Base price is required')
    .min(0, 'Base price cannot be negative'),
  selling_price: Yup.number()
    .typeError('Selling price must be a number')
    .required('Selling price is required')
    .min(0, 'Selling price cannot be negative')
    .test(
      'selling-price-check',
      'Selling price must be greater than or equal to base price',
      function (value) {
        const { base_price } = this.parent
        return value >= base_price
      }
    ),
  reorder_level: Yup.number()
    .typeError('Reorder level must be a number')
    .required('Reorder level is required')
    .min(0, 'Reorder level cannot be negative')
})

export const productCategorySchema = Yup.object().shape({
  name: Yup.string().required('Enter  name')
})

export const purchaseValidationSchema = Yup.object({
  product_id: Yup.string().required('Product is required'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than 0')
    .required('Quantity is required'),
  supplier_name: Yup.string().trim().required('Supplier name is required'),
  invoice_number: Yup.string().trim().required('Invoice number is required'),
  invoice_date: Yup.string().required('Enter  date'),
  cost_price: Yup.number()
    .typeError('Cost price must be a number')
    .min(0, 'Cost price cannot be negative')
    .required('Cost price is required')
})

export const addChargeSchema = Yup.object({
  transaction_type: Yup.string().required('Transaction type is required'),
  payment_method: Yup.string().required('Payment method is required'),
  category: Yup.string().required('Category is required'),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .required('Amount is required'),
  title: Yup.string().required('Title is required')
})
