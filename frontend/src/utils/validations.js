import * as Yup from "yup";
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const onboardingValidationSchema = Yup.object().shape({
  center_name: Yup.string().required("Center name is required"),
  contact_person: Yup.string().required("Contact person name is required"),
  center_email: Yup.string()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email format")
    .required("Contact email is required"),
  center_phone: Yup.string()
    .matches(/^[0-9]{10,12}$/, "Invalid phone number")
    .required("Contact phone is required"),
  city: Yup.string().required("City is required"),
  subscription_duration: Yup.string().required(
    "Subscription duration is required",
  ),
  is_terms_and_conditions: Yup.boolean().oneOf(
    [true],
    "You must accept the terms",
  ),
});

export const partnerOnboardingValidationSchema = () =>
  Yup.object().shape({
    full_name: Yup.string().required("Full name is required"),
    email: Yup.string()
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email format")
      .required("Email is required"),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Enter a valid 10 digit mobile number")
      .required("Mobile number is required"),
    city: Yup.string().trim().required("City is required"),
  });

export const partnerAgreementValidationSchema = Yup.object().shape({
  terms_accepted: Yup.boolean().oneOf(
    [true],
    "You must accept the reseller terms",
  ),
});

export const invoiceValidationSchema = Yup.object().shape({
  address_line_1: Yup.string().required("Enter address"),
  address_line_2: Yup.string().required("Enter pincode"),
  gst_number: Yup.string()
    .nullable()
    .notRequired()
    .test("gst-validation", "Invalid GST number", (value) => {
      if (!value) return true; //  optional field
      return gstRegex.test(value);
    }),
});

export const categoryValidationSchema = Yup.object().shape({
  name: Yup.string().required("Enter Designation"),
});

export const employeeValidationSchema = (isEdit) =>
  Yup.object().shape({
    full_name: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    mobile: Yup.string().required("Mobile is required"),
    designation_id: isEdit
      ? Yup.string()
      : Yup.string().required("Designation is required"),
    password: isEdit
      ? Yup.string()
      : Yup.string().required("Password is required"),
    // profile_photo: isEdit
    //   ? Yup.mixed()
    //   : Yup.mixed().required("Image is required"),
    joining_date: isEdit
      ? Yup.string()
      : Yup.string().required("Joining date is required"),
  });

export const membershipValidationSchema = Yup.object().shape({
  membership_name: Yup.string()
    .required("Membership name is required")
    .min(2, "Name must be at least 2 characters"),
  duration_count: Yup.number()
    .required("Duration required")
    .positive("Duration must be positive")
    .integer("Duration must be a whole number"),
  default_price: Yup.number()
    .required("Price is required")
    .positive("Price must be positive"),
  membership_features: Yup.array()
    .of(Yup.string().min(1, "Feature cannot be empty"))
    .min(1, "Add at least one feature"),
});

export const holidayValidationSchema = Yup.object().shape({
  holiday_name: Yup.string().required("Enter holiday name"),
  start_date: Yup.string().required("Enter start date"),
  end_date: Yup.string().required("Enter end date"),
});

export const attendanceValidationSchema = Yup.object().shape({
  employee_id: Yup.string().required("Select full name"),
  date: Yup.string().required("Enter date"),
  check_in_time: Yup.string().required("Enter check-in time"),
  check_out_time: Yup.string()
    .required("Checkout time is required")
    .test(
      "is-after-opening",
      "Checkout time must be after checkin time",
      function (value) {
        const { check_in_time } = this.parent;
        if (!check_in_time || !value) return true;

        return value > check_in_time;
      },
    ),
});

export const branchValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Branch name must be at least 3 characters")
    .max(50, "Branch name is too long")
    .required("Enter branch name"),
  center_category_id: Yup.string().required("Select center category"),
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
      (value) =>
        !value ||
        ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
          value.type,
        ),
    ),
  city: Yup.string().required("Select city"),
  postal_code: Yup.string().required("Enter postal code"),
});

export const brandingValidationSchema = Yup.object({
  primary_color: Yup.string().required("Primary color is required"),
  secondary_color: Yup.string().required("Secondary color is required"),
  app_name: Yup.string().required("App name is required"),
  app_logo: Yup.mixed()
    .nullable()
    .required("Upload an image")
    //  File or URL check
    .test("file-or-url", "Logo is required", (value) => {
      if (!value) return false;
      if (value instanceof File) return true;
      if (typeof value === "string" && value.trim() !== "") return true;
      return false;
    })
    //  File size validation
    .test("fileSize", "Image size must be less than 2MB", (value) => {
      if (typeof value === "string") return true;
      if (value instanceof File) {
        return value.size <= 2 * 1024 * 1024;
      }
      return true;
    }),
});

export const galleryImageValidationSchema = Yup.object().shape({
  image_url: Yup.mixed()
    .nullable()
    .required("Upload an image")
    //  File or URL check
    .test("file-or-url", "Image is required", (value) => {
      if (!value) return false;
      if (value instanceof File) return true;
      if (typeof value === "string" && value.trim() !== "") return true;
      return false;
    })
    //  File size validation
    .test("fileSize", "Image size must be less than 2MB", (value) => {
      if (typeof value === "string") return true;
      if (value instanceof File) {
        return value.size <= 2 * 1024 * 1024;
      }
      return true;
    }),
});

export const imageValidation = Yup.mixed()
  .nullable()
  .required("Upload an image")
  .test(
    "fileType",
    "Only JPG, JPEG, PNG files are allowed",
    (value) =>
      !value || ["image/jpeg", "image/png", "image/jpg"].includes(value.type),
  )
  .test(
    "fileSize",
    "Image size must be less than 2MB",
    (value) => !value || value.size <= 2 * 1024 * 1024,
  );

export const salaryValidationSchema = Yup.object().shape({
  employee_id: Yup.string().required("Select employee"),
  salary: Yup.number().required("Enter salary"),
  salary_type: Yup.string().required("Select salary type"),
  pay_cycle: Yup.string().required("Select pay cycle"),
});

export const memberValidationSchema = (isEdit = false) =>
  Yup.object().shape({
    full_name: Yup.string()
      .trim()
      .required("Full name is required")
      .min(3, "Name must be at least 3 characters"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Enter a valid 10 digit mobile number")
      .required("Mobile number is required"),
    date_of_birth: Yup.string()
      .nullable()
      .required("Date of birth is required")
      .test("valid-date", "Format should be DD-MM-YYYY", (value) => {
        if (!value) return false;

        const regex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

        if (!regex.test(value)) return false;

        const [day, month, year] = value.split("-");
        const date = new Date(`${year}-${month}-${day}`);

        return (
          date.getFullYear() === Number(year) &&
          date.getMonth() + 1 === Number(month) &&
          date.getDate() === Number(day)
        );
      }),
    membership_id: isEdit
      ? Yup.string().nullable().notRequired() // optional for edit
      : Yup.string().required("Please select a membership plan"), // required for create
    time_slot_id: Yup.string().required("Please select a time slot"),
    payment_method: isEdit
      ? Yup.string().nullable().notRequired()
      : Yup.string().when("payment_status", {
        is: "paid",
        then: (schema) => schema.required("Select payment method"),
        otherwise: (schema) => schema.nullable(),
      }),
    password: isEdit
      ? Yup.string().nullable().notRequired()
      : Yup.string().when("payment_status", {
        is: "paid",
        then: (schema) => schema.required("Password is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
  });

export const productValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required("Product name is required"),
  base_price: Yup.number()
    .typeError("Base price must be a number")
    .required("Base price is required")
    .min(0, "Base price cannot be negative"),
  selling_price: Yup.number().required("Selling price is required"),
  initial_stock:Yup.number().required('Quantity is required')
});

export const addStockValidationSchema = Yup.object().shape({
  unit_cost: Yup.number()
    .typeError("Unit cost must be a number")
    .required("Unit cost is required")
    .min(0, "Unit cost cannot be negative"),
  selling_price: Yup.number().required("Selling price is required"),
  product_id: Yup.string().required("Select a product"),
  quantity: Yup.string().required("Enter quantity")
});

export const productCategorySchema = Yup.object().shape({
  name: Yup.string().required("Enter  name"),
});

export const purchaseValidationSchema = Yup.object({
  product_id: Yup.string().required("Product is required"),
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .positive("Quantity must be greater than 0")
    .required("Quantity is required"),
  supplier_name: Yup.string().trim().required("Supplier name is required"),
  invoice_number: Yup.string().trim().required("Invoice number is required"),
  invoice_date: Yup.string().required("Enter  date"),
});

export const addChargeSchema = Yup.object({
  transaction_type: Yup.string().required("Transaction type is required"),
  payment_method: Yup.string().required("Payment method is required"),
  category: Yup.string().required("Category is required"),
  amount: Yup.number()
    .typeError("Amount must be a number")
    .required("Amount is required"),
  title: Yup.string().required("Title is required"),
});

export const visitorValidationSchema = (isEdit = false) =>
  Yup.object().shape({
    full_name: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Enter a valid 10 digit mobile number")
      .required("Mobile number is required"),
  });

export const centerTimingValidationSchema = Yup.object().shape({
  opening_time: Yup.string().required("Opening time is required"),
  closing_time: Yup.string()
    .required("Closing time is required")
    .test(
      "is-after-opening",
      "Closing time must be after opening time",
      function (value) {
        const { opening_time } = this.parent;
        if (!opening_time || !value) return true;

        return value > opening_time;
      },
    ),
});

export const centerSlotValidationSchema = Yup.object().shape({
  start_time: Yup.string().required("Opening time is required"),
  end_time: Yup.string()
    .required("Closing time is required")
    .test(
      "is-after-opening",
      "Closing time must be after opening time",
      function (value) {
        const { start_time } = this.parent;
        if (!start_time || !value) return true;

        return value > start_time;
      },
    ),
  slot_capacity: Yup.number()
    .typeError("Slot capacity must be a number")
    .required("Slot capacity is required")
    .min(0, "Slot capacity cannot be negative"),
});

export const profileValidationSchema = Yup.object().shape({
  about: Yup.string().required("About is required"),
  center_name: Yup.string().required("Center name is required"),
  center_phone: Yup.string()
    .required("Center phone is required")
    .matches(/^[0-9]{10}$/, "Center phone must be a valid 10-digit number"),
  center_email: Yup.string()
    .required("Center email is required")
    .email("Invalid email format"),
  whatsapp_number: Yup.number().required("Whatsapp number is required"),
});

export const taxValidationSchema = Yup.object({
  name: Yup.string().trim().required("Tax name is required"),
  tax_percentage: Yup.number()
    .typeError("Tax rate must be a number")
    .required("Tax rate is required")
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100"),
  tax_type: Yup.string().required("Tax type is required"),
  tax_scope: Yup.string().required("Tax scope is required"),
});

export const leadValidationSchema = Yup.object({
  center_name: Yup.string().required("Center name is required"),
  center_type: Yup.string().required("Center type is required"),
  contact_person_name: Yup.string().required("Contact person is required"),
  phone_number: Yup.string()
    .matches(/^[0-9]+$/, "Only numbers allowed")
    .length(10, "Must be 10 digits")
    .required("Phone number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  whatsapp_number: Yup.string()
    .matches(/^[0-9]*$/, "Only numbers allowed")
    .test("len", "Must be 10 digits", (val) => !val || val.length === 10),
  city: Yup.string().required("City is required"),
});

export const superadminValidationSchema = Yup.object({
  fullname: Yup.string().trim().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be a valid 10-digit number")
    .required("Mobile number is required"),
  whatsapp_number: Yup.string()
    .matches(/^[0-9]{10}$/, "Whatsapp number must be a valid 10-digit number")
    .required("Whatsapp number is required"),
  profile_photo: Yup.mixed().nullable(),
});

export const centerTypeValidationSchema = Yup.object({
  name: Yup.string().required("Center type name is required"),
  code: Yup.string().required("Code is required"),
  image: Yup.mixed().required("Image is required"),
});

export const accountValidationSchema = () =>
  Yup.object().shape({
    account_holder_name: Yup.string()
      .trim()
      .required("Account holder name is required"),
    bank_name: Yup.string().trim().required("Bank name is required"),
    account_number: Yup.string()
      .trim()
      .matches(/^[0-9]{9,18}$/, "Enter a valid account number")
      .required("Account number is required"),
    ifsc_code: Yup.string()
      .trim()
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/i, "Enter a valid IFSC code")
      .required("IFSC code is required"),
  });

  export const changePasswordValidationSchema = Yup.object({
  new_password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),

  confirm_password: Yup.string()
    .required("Confirm password is required")
    .oneOf(
      [Yup.ref("new_password")],
      "Passwords do not match"
    ),
});

export const emailResetPasswordValidationSchema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),

  confirm_password: Yup.string()
    .required("Confirm password is required")
    .oneOf(
      [Yup.ref("password")],
      "Passwords do not match"
    ),
});
