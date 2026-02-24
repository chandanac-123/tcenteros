import CustomeModal from '@common/CustomeModal'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import { Button } from '@pages/components/ui/button'

const RenewMembership = ({ open, setOpen }) => {
  return (
    <CustomeModal header='Renew Membership' open={open} onOpenChange={setOpen}>
      <form className='flex flex-col gap-2 lg:w-96 w-full'>
        <CustomeSelect
          label='Plan'
          name='center_id'
          placeholder='Select Plan'
        />
        <CustomeSelect
          label='Duration'
          name='center_id'
          placeholder='Select Duration'
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
            Renew Membership
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}
export default RenewMembership
