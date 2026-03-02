import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import InputFile from '@common/CustomeFileUpload'
import CustomeSelect from '@common/CustomeSelect'
import { Textarea } from '@pages/components/ui/textarea'
import {
  useGetProfileByIdQuery,
  useUpdateProfileMutation
} from '@api-queries/center-profile/Query'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'

const EditCenterInformation = ({ open, setOpen, editId }) => {
  const { data, isFetching } = useGetProfileByIdQuery(editId)
  console.log('1111111111: ', data)
  const { mutateAsync: update } = useUpdateProfileMutation()
  const [facilities, setFacilities] = useState(data?.facilities || [])
  const initialValues = {
    center_name: data?.center_name || '',
    category: data?.center_category_name || '',
    capacity: data?.center_code || '',
    approval_status: data?.center_email || '',
    center_status: data?.center_email || '',
    network_enabled: data?.center_email || '',
    networking_amount: data?.center_email || '',
    white_label_enabled: data?.center_email || '',
    kind_of_center: data?.center_email || '',
    members_count: data?.center_email || '',
    trainer_count: data?.center_email || '',
    gst_number: data?.center_email || '',
    live_class_enable: data?.center_email || '',
    country: data?.address?.country || '',
    state: data?.address?.state || '',
    city: data?.address?.city || '',
    pincode: data?.address?.pincode || '',
    about: data?.description || '',
    website_url: data?.website_link || '',
    facilities: data?.facilities || []
  }

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='Edit Center information '
      className='max-w-5xl w-full'
    >
      <form className='space-y-2 w-full'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <InputFile label='Upload Image' name='image_url' />
          </div>
          <div className='flex-1'>
            <Input
              label='About'
              name='full_name'
              placeholder='Enter Your Name'
            />
          </div>
        </div>
     
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
              label='Center Capacity'
              name='center_code'
              placeholder='Enter Center Code'
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Kind of Center'
              name='email'
              placeholder='Enter Your Email'
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Contact Person'
              name='center_code'
              placeholder='Enter Center Code'
            />
          </div>
          <div className='flex-1'>
            <Input
              label='gst_number'
              name='email'
              placeholder='Enter Your Email'
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Center Email'
              name='center_code'
              placeholder='Enter Center Code'
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Center Phone'
              name='email'
              placeholder='Enter Your Email'
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input label='Live Class' name='country' />
          </div>
          <div className='flex-1'>
            <Input label='Whataspp Number' name='state' />
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
            <Input label='Address 1' name='address' />
          </div>
          <div className='flex-1'>
            <Input label='Address 2' name='address' />
          </div>
        </div>
   <div className='flex-1'>
          {/* Grid Layout: 3 per row */}
          <div className='grid grid-cols-4 gap-4'>
            {facilities.map((facility, index) => (
              <div key={index} className='flex items-center gap-2'>
                <Input
                  value={facility}
                  onChange={e => {
                    const updated = [...facilities]
                    updated[index] = e.target.value
                    setFacilities(updated)
                  }}
                />

                <button
                  type='button'
                  onClick={() => {
                    const updated = facilities.filter((_, i) => i !== index)
                    setFacilities(updated)
                  }}
                  className='text-red-500 hover:text-red-700'
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <button
            type='button'
            onClick={() => setFacilities([...facilities, ''])}
            className='flex items-center gap-1 text-primary mt-3'
          >
            <Plus size={16} /> Add Facility
          </button>
        </div>
        <Input label='Website Link' name='website_link' />

        <div className='flex justify-end mt-4 gap-4'>
          <Button
            onClick={() => setOpen(false)}
            size='addbutton'
            variant='outline_secondary'
            type='submit'
          >
            Cancel
          </Button>
          <Button size='addbutton' variant='default' type='submit'>
            Update
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}
export default EditCenterInformation
