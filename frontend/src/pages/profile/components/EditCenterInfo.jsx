import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import InputFile from '@common/CustomeFileUpload'
import CustomeSelect from '@common/CustomeSelect'
import {
  useGetProfileByIdQuery,
  useUpdateProfileMutation
} from '@api-queries/center-profile/Query'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useFormik } from 'formik'

const EditCenterInformation = ({ open, setOpen, editId }) => {
  const { data, isFetching } = useGetProfileByIdQuery(editId)
  console.log('1111111111: ', data)
  const { mutateAsync: update } = useUpdateProfileMutation()
  const [facilities, setFacilities] = useState(data?.facilities || [])
  const initialValues = {
    center_name: data?.center_name || '',
    category: data?.center_category_name || '',
    capacity: data?.capacity || '',
    kind_of_center: data?.kind_of_center || '',
    center_phone: data?.center_phone || '',
    gst_number: data?.gst_number || '',
    center_email: data?.center_email || '',
    live_class_enable: data?.live_class_enable || '',
    country: data?.address?.country || '',
    state: data?.address?.state || '',
    city: data?.address?.city || '',
    postal_code: data?.address?.postal_code || '',
    address_line_1: data?.address?.address_line_1 || '',
    address_line_2: data?.address?.address_line_2 || '',
    about: data?.about || '',
    website_url: data?.website_link || '',
    facilities: data?.facilities || [],
    whatsapp_number: data?.whatsapp_number || ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async values => {
      values.facilities.forEach(f => {
        formData.append('facilities', f)
      })
      const formData = new FormData()
      try {
        await update(formData)
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='Edit Center information '
      className='max-w-5xl w-full'
    >
      <form className='space-y-2 w-full' onSubmit={formik.handleSubmit}>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='About'
              name='about'
              placeholder='Enter Your Name'
              value={formik.values.about}
              onChange={formik.handleChange}
            />
          </div>
        </div>

        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Center Name'
              name='center_name'
              placeholder='Enter Your Name'
              value={formik.values.center_name}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex-1'>
            <CustomeSelect
              label='Center Category'
              name='category'
              placeholder='Select Category'
              value={formik.values.category}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Center Capacity'
              name='capacity'
              placeholder='Enter Center Capacity'
              value={formik.values.capacity}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Kind of Center'
              name='kind_of_center'
              placeholder='Enter Kind of Center'
              value={formik.values.kind_of_center}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Contact Person'
              name='center_phone'
              placeholder='Enter Center Phone'
              value={formik.values.center_phone}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='GST Number'
              name='gst_number'
              placeholder='Enter GST Number'
              value={formik.values.gst_number}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Center Email'
              name='center_email'
              placeholder='Enter Center Email'
              value={formik.values.center_email}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Center Phone'
              name='center_phone'
              value={formik.values.center_phone}
              placeholder='Enter Center Phone'
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomeSelect
              options={[
                { id: true, name: 'Yes' },
                { id: false, name: 'No' }
              ]}
              label='Live Class'
              name='live_class_enable'
              value={formik.values.live_class_enable}
              onChange={option =>
                formik.setFieldValue('live_class_enable', option?.id)
              }
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Whatsapp Number'
              name='whatsapp_number'
              value={formik.values.whatsapp_number}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4'>
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
              label='State'
              name='state'
              value={formik.values.state}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4'>
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
              label='Pincode'
              name='postal_code'
              value={formik.values.postal_code}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Address 1'
              name='address_line_1'
              value={formik.values.address_line_1}
              onChange={formik.handleChange}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Address 2'
              name='address_line_2'
              value={formik.values.address_line_2}
              onChange={formik.handleChange}
            />
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
        <Input
          label='Website Link'
          name='website_url'
          value={formik.values.website_url}
          onChange={formik.handleChange}
        />

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
