import { Input } from '@pages/components/ui/input'
import SelectCategory from '@common/SelectCategory'
import CustomeSelect from '@common/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'
import CustomeModal from '@common/CustomeModal'
import { Plus } from 'lucide-react'
import AddCategory from './AddCategory'
import {
  useCategoriesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useEmployeeGetByIdQuery
} from '@api-queries/employee-management/Query'
import InputFile from '@common/CustomeFileUpload'
import { useAuthStore } from '@store/authStore'
import { useFormik } from 'formik'
import { employeeValidationSchema } from '@utils/validations'

const AddEditForm = ({ id, closeModal, open, setOpen }) => {
  const state = useAuthStore.getState()
  const { data, isFetching } = useCategoriesQuery()
  const { data: employeeData, isFetching: isEmployeeFetching } =
    useEmployeeGetByIdQuery(id)
  //   console.log('employeeData: ', employeeData)
  const { mutateAsync: createCategory, isPending } = useCreateEmployeeMutation()
  const { mutateAsync: updateCategory, isPending: updatePending } =
    useUpdateEmployeeMutation()
  const [categoryOpen, setCategoryOpen] = useState(false)
  //   console.log('state?.auth?.center_id: ', state?.auth?.center_id)

  const initialValues = {
    full_name: employeeData?.full_name || '',
    email: employeeData?.email || '',
    mobile: employeeData?.mobile || '',
    qualification: employeeData?.qualification || '',
    experience: employeeData?.experience || '',
    country: employeeData?.country || '',
    state: employeeData?.state || '',
    city: employeeData?.city || '',
    pin: employeeData?.pin || '',
    address: employeeData?.address || '',
    password: '',
    designation_id: employeeData?.designation_id || '',
    center_id: state?.auth?.center_id || '',
    joining_date: employeeData?.joining_date || '2026-02-10',
    document: null
  }

  const formik = useFormik({
    initialValues,
    validationSchema: employeeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      const fd = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value)
        }
      })
      try {
        if (id) {
          await updateCategory({ id, ...values })
        } else {
          await createCategory(fd)
        }
        closeModal()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const handleSelect = id => {
    formik.setFieldValue('designation_id', id)
  }

  return (
    <>
      <CustomeModal
        open={open}
        onOpenChange={setOpen}
        header={id ? 'Edit Employee' : 'Create Employee'}
      >
        <form className='space-y-2' onSubmit={formik.handleSubmit}>
          <span>Select Category</span>
          <div className='w-full'>
            <div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
              {data?.map(item => (
                <SelectCategory
                  key={item.id}
                  item={item}
                  selected={formik.values.designation_id === item.id}
                  onSelect={() => handleSelect(item.id)}
                />
              ))}
              {id ? (
                ''
              ) : (
                <label
                  onClick={() => setCategoryOpen(true)}
                  className='flex flex-col items-center border rounded-lg p-2 w-full cursor-pointer justify-center border-secondary'
                >
                  <Plus className='w-6 h-6 text-secondary' />
                  <span className='flex-1 text-sm text-secondary'>
                    Add Designation
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Full Name'
                name='full_name'
                value={formik.values.full_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
                onBlur={formik.handleBlur}
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
                onBlur={formik.handleBlur}
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
              <Input
                label='Country'
                name='country'
                value={formik.values.country}
                onChange={formik.handleChange}
              />
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='State'
                name='state'
                value={formik.values.state}
                onChange={formik.handleChange}
              />
            </div>
            <div className='flex-1'>
              <Input
                label='City'
                name='city'
                value={formik.values.city}
                onChange={formik.handleChange}
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
          <div className='flex gap-4 '>
            <div className='flex-1'>
              <Input
                label='Password'
                name='password'
                type='password'
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && formik.errors.password}
              />
            </div>
            <div className='flex-1'>
              <InputFile
                label='Upload Image'
                name='document'
                onChange={e => {
                  formik.setFieldValue('document', e.currentTarget.files[0])
                }}
              />
            </div>
          </div>
          <div className='flex gap-4 '>
            <div className='flex-1'>
              <CustomeSelect
                label='Choose Center'
                name='center_id'
                value={formik.values.center_id}
                onChange={formik.handleChange}
                placeholder='Choose Center'
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Joining Date'
                name='joining_date'
                value={formik.values.joining_date}
                onChange={formik.handleChange}
              />
            </div>
          </div>

          <div className='flex justify-center mt-4 '>
            <Button size='addbutton' variant='default' type='submit'>
              {id ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
        {/* {process.env.NODE_ENV === 'development' && (
          <pre className='text-xs text-red-500'>
            {JSON.stringify(formik.errors, null, 2)}
          </pre>
        )} */}
      </CustomeModal>
      <AddCategory
        categoryOpen={categoryOpen}
        setCategoryOpen={setCategoryOpen}
      />
    </>
  )
}
export default AddEditForm
