import { Input } from '@pages/components/ui/input'
import SelectCategory from '@common/components/SelectCategory'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Plus } from 'lucide-react'
import {
  useCategoriesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useEmployeeGetByIdQuery
} from '@api-queries/employee-management/Query'
import InputFile from '@common/components/CustomeFileUpload'
import { useFormik } from 'formik'
import { employeeValidationSchema } from '@utils/validations'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import { format } from 'date-fns'
import AddCategory from '../category/AddCategory'
import CitySelect from '@common/components/CitySelect'
import StateSelect from '@common/components/StateSelect'
import CountrySelect from '@common/components/CountrySelect'

const AddEditForm = ({ id, closeModal, open, setOpen }) => {
  const { data, isFetching } = useCategoriesQuery()
  const { data: employeeData, isFetching: isEmployeeFetching } =
    useEmployeeGetByIdQuery(id)
  const { mutateAsync: createEmployee, isPending } = useCreateEmployeeMutation()
  const { mutateAsync: updateEmployee, isPending: updatePending } =
    useUpdateEmployeeMutation()
  const [categoryOpen, setCategoryOpen] = useState(false)

  const initialValues = {
    full_name: employeeData?.full_name || '',
    email: employeeData?.email || '',
    mobile: employeeData?.mobile || '',
    qualification: employeeData?.qualification || '',
    experience: employeeData?.experience || '',
    country: employeeData?.address?.country || '',
    state: employeeData?.address?.state || '',
    city: employeeData?.address?.city || '',
    pin: employeeData?.address?.pin || '',
    address: employeeData?.address?.address || '',
    password: '',
    designation_id: employeeData?.designation_id || '',
    center_id: '',
    joining_date: employeeData?.joining_date || '',
    profile_photo: employeeData?.profile_photo || null
  }

  const formik = useFormik({
    initialValues,
    validationSchema: employeeValidationSchema(!!id),
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const fd = new FormData()

        // ✅ convert ISO → Name
        const finalValues = {
          ...values
        }
        if (id) {
          const allowedFields = [
            'full_name',
            'email',
            'mobile',
            'qualification',
            'experience',
            'country',
            'state',
            'city',
            'pin',
            'address'
          ]
          allowedFields.forEach(field => {
            if (
              finalValues[field] !== undefined &&
              finalValues[field] !== null
            ) {
              fd.append(field, finalValues[field])
            }
          })
          if (values.profile_photo instanceof File) {
            fd.append('profile_photo', values.profile_photo)
          }
          await updateEmployee({ id, data: fd })
        } else {
          Object.entries(finalValues).forEach(([key, value]) => {
            if (key !== 'profile_photo' && value) {
              fd.append(key, value)
            }
          })
          if (values.profile_photo) {
            fd.append('profile_photo', values.profile_photo)
          }
          await createEmployee(fd)
        }
        formik.resetForm()
        closeModal()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const handleSelect = id => {
    formik.setFieldValue('designation_id', id, true)
    // third argument = shouldValidate (IMPORTANT)
    formik.setFieldTouched('designation_id', true, false)
  }

  const handleDateChange = (field, val) => {
    formik.setFieldValue(field, val ? format(val, 'yyyy-MM-dd') : '')
  }

  return (
    <>
      <CustomeModal
        open={open}
        onOpenChange={setOpen}
        header={id ? 'Edit Employee' : 'Create Employee'}
      >
        <form className='space-y-2' onSubmit={formik.handleSubmit}>
          {!id && (
            <>
              <span>Select Category</span>
              <div className='w-full'>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
                  {data?.map(item => (
                    <SelectCategory
                      key={item.id}
                      item={item}
                      selected={formik.values.designation_id === item.id}
                      onSelect={() => handleSelect(item.id)}
                    />
                  ))}

                  <label
                    onClick={() => setCategoryOpen(true)}
                    className='flex flex-col items-center border rounded-lg p-2 w-full cursor-pointer justify-center border-secondary'
                  >
                    <Plus className='w-6 h-6 text-secondary' />
                    <span className='flex-1 text-sm text-secondary'>
                      Add Designation
                    </span>
                  </label>
                </div>
                {formik.touched.designation_id &&
                  formik.errors.designation_id && (
                    <div className='text-xs text-red-500 mt-1'>
                      {formik.errors.designation_id}
                    </div>
                  )}{' '}
              </div>
            </>
          )}
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Full Name'
                name='full_name'
                value={formik.values.full_name}
                onChange={formik.handleChange}
                // onBlur={formik.handleBlur}
                error={formik.touched.full_name && formik.errors.full_name}
                placeholder='Enter Your Full Name'
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Email ID'
                name='email'
                value={formik.values.email}
                onChange={formik.handleChange}
                // onBlur={formik.handleBlur}
                error={formik.touched.email && formik.errors.email}
                placeholder='Enter Your Email ID'
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Mobile Number'
                name='mobile'
                value={formik.values.mobile}
                onChange={formik.handleChange}
                // onBlur={formik.handleBlur}
                error={formik.touched.mobile && formik.errors.mobile}
                placeholder='Enter Your Mobile Number'
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Qualification'
                name='qualification'
                value={formik.values.qualification}
                onChange={formik.handleChange}
                placeholder='Enter Your Qualification'
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Total Experience'
                name='experience'
                type='number'
                value={formik.values.experience}
                onChange={formik.handleChange}
              />
            </div>
            <div className='flex-1'>
              <CountrySelect
                value={formik.values.country}
                onChange={val => {
                  formik.setFieldValue('country', val.country)
                }}
                label='Country'
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <StateSelect
                country={formik.values.countryCode} 
                value={formik.values.state}
                onChange={val => formik.setFieldValue('state', val)}
                label='State'
              />
            </div>
            <div className='flex-1'>
              <CitySelect
                country={formik.values.countryCode}
                value={formik.values.city}
                onChange={data => {
                  formik.setFieldValue('city', data.city)
                  formik.setFieldValue('state', data.state) // auto-fill
                }}
                label='City'
              />
            </div>
          </div>
          <div className='flex gap-4 '>
            <div className='flex-1'>
              <Input
                label='Pin'
                name='pin'
                value={formik.values.pin}
                onChange={formik.handleChange}
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Address'
                name='address'
                value={formik.values.address}
                onChange={formik.handleChange}
              />
            </div>
          </div>
          {!id && (
            <>
              <div className='flex gap-4 '>
                <div className='flex-1'>
                  <Input
                    label='Password'
                    name='password'
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    // onBlur={formik.handleBlur}
                    error={formik.touched.password && formik.errors.password}
                  />
                </div>
                <div className='flex-1'>
                  <CustomDatePicker
                    label='Joining Date'
                    name='joining_date'
                    value={
                      formik.values.joining_date
                        ? new Date(formik.values.joining_date)
                        : null
                    }
                    onChange={val => handleDateChange('joining_date', val)}
                    error={
                      formik.touched.joining_date && formik.errors.joining_date
                    }
                  />
                </div>
              </div>

              <div className='flex gap-4 '>
                <div className='flex-1'>
                  <InputFile
                    label='Upload Image'
                    name='profile_photo'
                    value={formik.values.profile_photo}
                    onChange={formik.handleChange}
                    onRemove={() => {
                      formik.setFieldValue('profile_photo', null)
                      formik.setFieldTouched('profile_photo', true, false)
                    }}
                    error={
                      formik.touched.profile_photo &&
                      formik.errors.profile_photo
                    }
                  />
                </div>
                <div className='flex-1'></div>
              </div>
            </>
          )}

          <div className='flex justify-center mt-4 '>
            <Button size='addbutton' variant='default' type='submit'>
              {id ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </CustomeModal>
      <AddCategory
        categoryOpen={categoryOpen}
        setCategoryOpen={setCategoryOpen}
      />
    </>
  )
}
export default AddEditForm
