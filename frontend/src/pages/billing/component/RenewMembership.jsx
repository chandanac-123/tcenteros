import CustomeModal from '@common/components/CustomeModal'
import CustomeSelect from '@common/components/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import {
  useRenewMembershipMutation,
  useGetRenewMembershipByIdQuery
} from '@api-queries/center-admin/billing/Query'
import { useActiveMembersPlanQuery } from '@api-queries/center-admin/crm/Query'
import { useFormik } from 'formik'
import { Checkbox } from '@pages/components/ui/checkbox'

const paymentTypes = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'other', label: 'Others' }
]

const RenewMembership = ({ open, setOpen, membershipId }) => {
  const { data, isFetching } = useGetRenewMembershipByIdQuery(membershipId)
  const { data: memberPlan } = useActiveMembersPlanQuery()
  const { mutateAsync: renew_membership, isPending } =
    useRenewMembershipMutation()

  const initialValues = {
    membership_id: data?.member_membership_id || '',
    payment_method: '',
    payment_status: 'paid'
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        await renew_membership({ data: values, id: data?.member_id })
        setOpen(false)
        formik.resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <CustomeModal header='Renew Membership' open={open} onOpenChange={setOpen}>
      <form
        className='flex flex-col gap-2 lg:w-96 w-full'
        onSubmit={formik.handleSubmit}
      >
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold'>Current Plan : </span>
          <p className='text-sm font-semibold text-red_text'>
            {data?.plan_name}
          </p>
        </div>
        <CustomeSelect
          label='Choose your Plan'
          name='membership_id'
          placeholder='Select Plan'
          options={memberPlan}
          value={formik.values.membership_id}
          onChange={value => formik.setFieldValue('membership_id', value)}
        />
        <CustomeSelect
          label='Payment Type'
          name='payment_method'
          placeholder='Select Payment Type'
          value={formik.values.payment_method}
          onChange={value => formik.setFieldValue('payment_method', value)}
          options={paymentTypes}
        />
        <div className='flex gap-2 items-center justify-end'>
          <Checkbox checked={true} />
          <p>Mark as Paid</p>
        </div>
        <div className='flex justify-end mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            Renew Membership
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}
export default RenewMembership
