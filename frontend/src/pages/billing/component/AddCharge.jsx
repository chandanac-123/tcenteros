import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/components/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import { useRenewMembershipMutation } from '@api-queries/billing/Query'

const AddCharge = ({ open, setOpen }) => {
  const { mutateAsync: renew_membership, isPending } =
    useRenewMembershipMutation()
  return (
    <CustomeModal header='Add Charge' open={open} onOpenChange={setOpen}>
      <form className='flex flex-col gap-2 lg:w-96 w-full'>
        <CustomeSelect
          label='Plan'
          name='center_id'
          placeholder='Select Plan'
        />
        <Input
          className='w-full'
          label='Discount'
          placeholder='Enter  ₹'
          name='name'
        />
        <Input
          className='w-full'
          label='Total: ₹____'
          placeholder='Enter  ₹'
          name='name'
        />
        <div className='flex justify-end mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            Add Charge
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}
export default AddCharge
