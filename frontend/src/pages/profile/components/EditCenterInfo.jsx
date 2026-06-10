import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/components/CustomeSelect'
import {
  useGetProfileByIdQuery,
  useUpdateProfileMutation
} from '@api-queries/center-admin/center-profile/Query'
import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import DynamicListInput from './DynamicListInput'
import CountrySelect from '@common/components/CountrySelect'
import StateSelect from '@common/components/StateSelect'
import CitySelect from '@common/components/CitySelect'
import { profileValidationSchema } from '@utils/validations'
import { classModes } from '@constants/classMode'

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
    capacity: data?.capacity || null,
    kind_of_center: data?.kind_of_center || '',
    contact_person: data?.contact_person || '',
    center_phone: data?.center_phone || '',
    gst_number: data?.gst_number || '',
    center_email: data?.center_email || '',
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
    validationSchema: profileValidationSchema,
    onSubmit: async values => {
      try {
        const payload = {
          ...values,
          facilities,
          country: values.country,
          state: values.state,
          currently_using_digital_tool: digitalTools,
          marketing_platform: marketingPlatforms
        }
        await update(payload)
        formik.resetForm()
        setOpen(false)
      } catch (error) {
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
        <Input
          label='About'
          name='about'
          placeholder='Enter a brief introduction '
          value={formik.values.about}
          onChange={formik.handleChange}
          error={formik.touched.about && formik.errors.about}
        />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input
            label='Center Name'
            name='center_name'
            placeholder='Enter Your Name'
            value={formik.values.center_name}
            onChange={formik.handleChange}
            error={formik.touched.center_name && formik.errors.center_name}
          />
          <Input
            label='Center Capacity'
            name='capacity'
            placeholder='Enter Center Capacity'
            value={formik.values.capacity}
            onChange={formik.handleChange}
          />
          <CustomeSelect
            options={classModes}
            label='Kind of Center'
            name='kind_of_center'
            placeholder='Enter Kind of Center'
            value={formik.values.kind_of_center}
            onChange={option =>
              formik.setFieldValue('kind_of_center', option)
            }
          />
          <Input
            label='Contact Person'
            name='contact_person'
            placeholder='Enter Contact Person'
            value={formik.values.contact_person}
            onChange={formik.handleChange}
          />
          <Input
            label='GST Number'
            name='gst_number'
            placeholder='Enter GST Number'
            value={formik.values.gst_number}
            onChange={formik.handleChange}
          />
          <Input
            label='Center Email'
            name='center_email'
            placeholder='Enter Center Email'
            value={formik.values.center_email}
            onChange={formik.handleChange}
            error={formik.touched.center_email && formik.errors.center_email}
          />
          <Input
            label='Center Phone'
            name='center_phone'
            value={formik.values.center_phone}
            placeholder='Enter Center Phone'
            onChange={formik.handleChange}
            error={formik.touched.center_phone && formik.errors.center_phone}
          />
          <Input
            label='Whatsapp Number'
            name='whatsapp_number'
            value={formik.values.whatsapp_number}
            onChange={formik.handleChange}
            error={
              formik.touched.whatsapp_number && formik.errors.whatsapp_number
            }
          />
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
          <StateSelect
            country={formik.values.country}
            value={formik.values.state}
            onChange={val => formik.setFieldValue('state', val)}
            label='State'
          />
          <CountrySelect
            value={formik.values.country}
            onChange={val => {
              formik.setFieldValue('country', val.country)
            }}
            label='Country'
          />
          <Input
            label='Pincode'
            name='postal_code'
            value={formik.values.postal_code}
            onChange={formik.handleChange}
          />
          <Input
            label='Address 1'
            name='address_line_1'
            value={formik.values.address_line_1}
            onChange={formik.handleChange}
          />
          <Input
            label='Address 2'
            name='address_line_2'
            value={formik.values.address_line_2}
            onChange={formik.handleChange}
          />
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
