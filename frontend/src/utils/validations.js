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

export const branchValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Branch name must be at least 3 characters")
    .max(50, "Branch name is too long")
    .required("Enter branch name"),

  center_category_id: Yup.string()
    .required("Select center category"),

  address_line_1: Yup.string()
    .min(5, "Address is too short")
    .required("Enter address line 1"),

  address_line_2: Yup.string()
    .min(5, "Address is too short")
    .required("Enter address line 2"),

  center_email: Yup.string()
    .email("Invalid email format")
    .required("Enter branch email"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Create password"),

  center_phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Enter phone number"),

  center_image: Yup.mixed()
    .required("Upload profile picture")
    .test(
      "fileType",
      "Unsupported file format",
      value =>
        !value ||
        ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(value.type)
    ),
  country: Yup.string()
    .required("Select country"),
  state: Yup.string()
    .required("Select state"),
  city: Yup.string()
    .required("Select city"),
  district: Yup.string()
    .required("Select district"),
  postal_code: Yup.string()
    .required("Enter postal code"),
});

export const brandingValidationSchema = Yup.object({
  app_name: Yup.string().required('App name is required'),
  primary_color: Yup.string().required('Primary color is required'),
  secondary_color: Yup.string().required(),
  app_logo: Yup.mixed().test(
    'file-or-url',
    'Logo is required',
    function (value) {
      if (!value) return false
      // If it's a File object
      if (value instanceof File) return true
      // If it's existing URL string
      if (typeof value === 'string') return true
      return false
    }
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
