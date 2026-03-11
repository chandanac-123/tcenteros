import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/components/CustomeSelect'
import {
  useGetProfileByIdQuery,
  useUpdateProfileMutation
} from '@api-queries/center-profile/Query'
import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import DynamicListInput from './DynamicListInput'

const EditCenterInformation = ({ open, setOpen, editId }) => {
  const { data, isFetching } = useGetProfileByIdQuery(editId)
  const { mutateAsync: update } = useUpdateProfileMutation(editId)
  const [facilities, setFacilities] = useState([])
  const [digitalTools, setDigitalTools] = useState([])
  const [marketingPlatforms, setMarketingPlatforms] = useState([])

  useEffect(() => {
    if (data) {
      setFacilities(data?.facilities || [])
      setDigitalTools(data?.currently_using_digital_tool || [])
      setMarketingPlatforms(data?.marketing_platform || [])
    }
  }, [data])

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
    website_url: data?.website_url || '',
    facilities: data?.facilities || [],
    currently_using_digital_too: data?.currently_using_digital_tool || [],
    marketing_platform: data?.marketing_platform || [],
    whatsapp_number: data?.whatsapp_number || ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const payload = {
          ...values,
          facilities,
          currently_using_digital_tool: digitalTools,
          marketing_platform: marketingPlatforms
        }
        await update(payload)
        formik.resetForm()
        setOpen(false)
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
          <div className='flex-1'>
            <Input
              label='Center Name'
              name='center_name'
              placeholder='Enter Your Name'
              value={formik.values.center_name}
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
                formik.setFieldValue('live_class_enable', option)
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

        <DynamicListInput
          label='Facilities'
          values={facilities}
          setValues={setFacilities}
        />
        <DynamicListInput
          label='Currently Using Digital Tools'
          values={digitalTools}
          setValues={setDigitalTools}
        />
        <DynamicListInput
          label='Marketing Platforms'
          values={marketingPlatforms}
          setValues={setMarketingPlatforms}
        />
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
            type='button'
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
