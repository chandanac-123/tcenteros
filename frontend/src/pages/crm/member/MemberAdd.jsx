import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import CustomeBreadcrumb from '@common/CustomeBreadcrumb'
import CustomeTab from '@common/CustomeTab'
import {
  useCreateMemberMutation,
  useMembersTimeSlotQuery,
  useMembersGetByIdQuery,
  useUpdateMemberMutation,
  useMembersPlanQuery
} from '@api-queries/crm/Query'
import { useFormik } from 'formik'
import TimeSlotSelector from '../components/TimeSlotSelector'
import { useAuthStore } from '@store/authStore'
import { useSettingsTabStore } from '@store/tabStore'
import { useNavigate } from 'react-router-dom'

const paidStatus = [
  { id: 'unpaid', name: 'unpaid' },
  { id: 'paid', name: 'paid' }
]
const paymentMethod = [
  { id: 'cash', name: 'Cash' },
  { id: 'upi', name: 'UPI' }
]
const genderOption = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
  { id: 'other', name: 'Other' }
]

const MemberAdd = ({ memberId, isEdit, goBack }) => {
  const state = useAuthStore.getState()
  const navigate = useNavigate()
  const { setSelectedTab } = useSettingsTabStore()
  const { mutateAsync: createMember } = useCreateMemberMutation()
  const { mutateAsync: updateMember } = useUpdateMemberMutation()
  const { data: memberTimeSlot } = useMembersTimeSlotQuery(
    state?.auth?.center_id
  )
  const { data: memberData } = useMembersGetByIdQuery(memberId)
  const { data: memberPlan } = useMembersPlanQuery()

  const initialValues = {
    center_id: state?.auth?.center_id,
    full_name: memberData?.full_name || '',
    email: memberData?.email || '',
    mobile: memberData?.mobile || '',
    gender: memberData?.gender || '',
    date_of_birth: memberData?.date_of_birth || '',
    blood_group: memberData?.blood_group || '',
    address_line_1: memberData?.address_line_1 || '',
    address_line_2: memberData?.address_line_2 || '',
    city: memberData?.city || '',
    state: memberData?.state || '',
    country: memberData?.country || '',
    postal_code: memberData?.postal_code || '',
    membership_id: memberData?.membership_id || '',
    time_slot_id: memberData?.time_slot_id || '',
    member_status: 'member',
    payment_method: memberData?.payment_method || '',
    payment_status: memberData?.payment_status || 'unpaid',
    password: ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const payload = { ...values }

        if (payload.payment_status === 'unpaid') {
          delete payload.password
          delete payload.payment_method
        }

        if (isEdit) {
          await updateMember({ memberId, ...payload })
        } else {
          await createMember(payload)
          formik.resetForm()
        }
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <div className='flex flex-col gap-4 pb-6'>
      <CustomeBreadcrumb
        goBack={goBack}
        buttonName='Members Listing'
        currentPageName={
          isEdit ? 'Member Updation Form' : 'Member Creation Form'
        }
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
              label='Address'
              name='address_line_1'
              value={formik.values.address_line_1}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Address'
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
            <CustomeSelect
              options={memberPlan}
              search={true}
              value={formik.values.membership_id}
              onChange={value => formik.setFieldValue('membership_id', value)}
              label='Membership Plan '
              name='membership_id'
            />
          </div>
          <div className='flex-1'>
            <div className='flex-1'>
              <span className='text-sm'>Membership Status </span>
              <div className='cursor-pointer px-4 py-1.5 rounded-md  text-onboard_primary border border-onboard_primary bg-onboard_primary/10'>
                Member
              </div>
            </div>
          </div>
        </div>
        {formik?.values?.payment_status == 'paid' && (
          <div className='flex gap-4 '>
            <div className='flex-1'>
              <CustomeSelect
                label='Payment Method'
                name='payment_method'
                options={paymentMethod}
                value={formik.values.payment_method}
                onChange={value =>
                  formik.setFieldValue('payment_method', value)
                }
              />
            </div>
            <div className='flex-1'>
              <Input
                label='Set Password'
                name='password'
                value={formik.values.password}
                onChange={formik.handleChange}
              />
            </div>
          </div>
        )}

        <div className='flex justify-end'>
          <CustomeTab
            tabList={paidStatus}
            defaultVal={formik.values.payment_status}
            tabsListClass='w-40 p-[1px] rounded-full'
            tabsTriggerClass='rounded-full'
            onChange={value => formik.setFieldValue('payment_status', value)}
          />
        </div>
        <div className='flex justify-between items-center pt-4'>
          <span className='text-md font-semibold'>Select Time Slot</span>
          <Button
            type='button'
            size='addbutton'
            onClick={() => {
              setSelectedTab(2)
              navigate('/settings')
            }}
          >
            Add Time Slot
          </Button>
        </div>

        <div className='flex flex-col'>
          <TimeSlotSelector
            slots={memberTimeSlot}
            selectedSlot={formik.values.time_slot_id}
            onChange={id => formik.setFieldValue('time_slot_id', id)}
          />
        </div>

        <div className='flex justify-center mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            {isEdit ? 'Update Member' : 'Create Member'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default MemberAdd
