import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import CustomeBreadcrumb from '@common/CustomeBreadcrumb'
import {
  useCreateMemberMutation,
  useMembersGetByIdQuery,
  useUpdateMemberMutation
} from '@api-queries/crm/Query'
import { useFormik } from 'formik'
import { useAuthStore } from '@store/authStore'

const genderOption = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
  { id: 'other', name: 'Other' }
]

const VisitorAdd = ({ goBack }) => {
  const state = useAuthStore.getState()
  const { mutateAsync: createMember } = useCreateMemberMutation()

  const initialValues = {
    center_id: state?.auth?.center_id,
    full_name: '',
    email: '',
    mobile: '',
    gender: '',
    date_of_birth: '',
    blood_group: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    member_status: 'visitor'
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        await createMember(values)
        formik.resetForm()
        goBack()
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <div className='flex flex-col gap-4 space-y-2'>
      <CustomeBreadcrumb
        goBack={goBack}
        buttonName='Visitor Listing'
        currentPageName={'Visitor Creation Form'}
      />
      <form className='space-y-2' onSubmit={formik.handleSubmit}>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Full Name'
              name='full_name'
              value={formik.values.full_name}
              onChange={formik.handleChange}
              placeholder='Enter Your Full Name'
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Email ID'
              name='email'
              value={formik.values.email}
              onChange={formik.handleChange}
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
              placeholder='Enter Your Mobile Number'
            />
          </div>
          <div className='flex-1'>
            <CustomeSelect
              label='Gender'
              name='gender'
              options={genderOption}
              placeholder='Select Gender'
              value={formik.values.gender}
              onChange={value => formik.setFieldValue('gender', value)}
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Date of Birth'
              name='date_of_birth'
              value={formik.values.date_of_birth}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Blood Group'
              name='blood_group'
              value={formik.values.blood_group}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4 '>
          <div className='flex-1'>
            <Input
              label='Address line 1'
              name='address_line_1'
              value={formik.values.address_line_1}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Address line 2'
              name='address_line_2'
              value={formik.values.address_line_2}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4 '>
          <div className='flex-1'>
            <Input
              label='City'
              name='city'
              value={formik.values.city}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='State'
              name='state'
              value={formik.values.state}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4 '>
          <div className='flex-1'>
            <Input
              label='Country'
              name='country'
              value={formik.values.country}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Pin Code'
              name='postal_code'
              value={formik.values.postal_code}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4 '>
          <div className='flex-1'>
            <div className='flex-1'>
              <span className='text-sm'>Membership Status </span>
              <div className='cursor-pointer px-4 py-1.5 rounded-md  text-onboard_primary border border-onboard_primary bg-onboard_primary/10'>
                Visitor
              </div>
            </div>
          </div>
          <div className='flex-1'></div>
        </div>

        <div className='flex justify-end mt-6'>
          <Button size='addbutton' variant='default' type='submit'>
            Create Visitor
          </Button>
        </div>
      </form>
    </div>
  )
}

export default VisitorAdd
