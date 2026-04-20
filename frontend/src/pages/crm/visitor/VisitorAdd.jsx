import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/components/CustomeSelect'
import CustomeBreadcrumb from '@common/components/CustomeBreadcrumb'
import { useCreateMemberMutation } from '@api-queries/center-admin/crm/Query'
import { useFormik } from 'formik'
import { useAuthStore } from '@store/authStore'
import CountrySelect from '@common/components/CountrySelect'
import StateSelect from '@common/components/StateSelect'
import CitySelect from '@common/components/CitySelect'
import { visitorValidationSchema } from '@utils/validations'

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
    validationSchema: visitorValidationSchema,
    onSubmit: async values => {
      try {
        if (values.date_of_birth) {
          const [day, month, year] = values.date_of_birth.split('-')
          values.date_of_birth = `${year}-${month}-${day}`
        }
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
              error={formik.touched.full_name && formik.errors.full_name}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Email ID'
              name='email'
              value={formik.values.email}
              onChange={formik.handleChange}
              placeholder='Enter Your Email ID'
              error={formik.touched.email && formik.errors.email}
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
              error={formik.touched.mobile && formik.errors.mobile}
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
              placeholder='DD-MM-YYYY'
              value={formik.values.date_of_birth}
              onChange={formik.handleChange}
              error={
                formik.touched.date_of_birth && formik.errors.date_of_birth
              }
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
            <CitySelect
              country={formik.values.countryCode}
              value={formik.values.city}
              onChange={data => {
                formik.setFieldValue('city', data.city)
                formik.setFieldValue('state', data.state) // auto-fill
                formik.setFieldValue('country', data.country) // auto-fill country
              }}
              label='City'
            />
          </div>
          <div className='flex-1'>
            <StateSelect
              country={formik.values.countryCode}
              value={formik.values.state}
              onChange={val => formik.setFieldValue('state', val)}
              label='State'
            />
          </div>
        </div>
        <div className='flex gap-4 '>
          <div className='flex-1'>
            <CountrySelect
              value={formik.values.country}
              onChange={val => {
                formik.setFieldValue('country', val.country)
              }}
              label='Country'
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
