import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/components/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import { useRenewMembershipMutation } from '@api-queries/billing/Query'
import { Textarea } from '@pages/components/ui/textarea'

const AddCharge = ({ openAddCharge, setOpenAddCharge }) => {
  const { mutateAsync: renew_membership, isPending } =
    useRenewMembershipMutation()
  return (
    <CustomeModal
      header='Add Charge'
      open={openAddCharge}
      onOpenChange={setOpenAddCharge}
    >
      <form className='flex flex-col gap-2 lg:w-96 w-full'>
        <CustomeSelect
          label='Select Member'
          name='center_id'
          placeholder='Select Plan'
        />
        <Input label='Amount' placeholder='Enter amount' name='name' />
        <Textarea
          label='Description'
          placeholder='Enter Description'
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
