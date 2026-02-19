import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import InputFile from '@common/CustomeFileUpload'
import CustomeSelect from '@common/CustomeSelect'
import { Textarea } from '@pages/components/ui/textarea'

const EditCenterInformation = ({ open, setOpen }) => {
  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='Edit Center information '
    >
      <form className='space-y-2'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Center Name'
              name='full_name'
              placeholder='Enter Your Name'
            />
          </div>
          <div className='flex-1'>
            <CustomeSelect
              label='Center Category'
              name='category'
              placeholder='Select Category'
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Email *'
              name='center_code'
              placeholder='Enter Center Code'
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Phone *'
              name='email'
              placeholder='Enter Your Email'
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input label='Country' name='country' />
          </div>
          <div className='flex-1'>
            <Input label='State' name='state' />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input label='City' name='city' />
          </div>
          <div className='flex-1'>
            <Input label='Pincode' name='pincode' />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <InputFile label='Upload Image' name='profile_photo' />
          </div>
          <div className='flex-1'></div>
        </div>
        <Input label='Address 1' name='address' />
        <Input label='Address 2' name='address' />
        <Textarea label='Description' name='description' />

        <div className='flex justify-end mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            'Add Employee
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}
export default EditCenterInformation
