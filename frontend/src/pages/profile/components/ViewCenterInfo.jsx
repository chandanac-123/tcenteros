import CustomeModal from '@common/components/CustomeModal'
import { useGetProfileByIdQuery } from '@api-queries/center-admin/center-profile/Query'
import profile from '@assets/dummy/profile.png'

const ViewCenterInfo = ({ open, setOpen, viewId }) => {
  const { data, isFetching } = useGetProfileByIdQuery(viewId)

  if (isFetching || !data) return null

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='View Center Information'
      className='max-w-6xl w-full'
    >
      <div className='space-y-6'>
        {/* Image + About */}
        <div className='flex gap-6'>
          <div className='w-40'>
            <img
              src={data?.center_image_url || profile}
              alt='Center'
              className='w-40 h-40 rounded-lg object-cover border'
            />
          </div>

          <div className='flex-1'>
            <p className='text-sm text-pricing_text'>About</p>
            <p className='mt-2 text-base'>{data?.about || '-'}</p>
          </div>
        </div>

        {/* Basic Details */}
        <SectionTitle title='Basic Information' />

        <div className='grid grid-cols-4 gap-6'>
          <Info label='Center Name' value={data?.center_name} />
          <Info label='Center Category' value={data?.center_category?.name} />
          <Info label='Center Capacity' value={data?.capacity} />
          <Info label='Kind of Center' value={data?.kind_of_center} />
        </div>

        {/* Contact Details */}
        <SectionTitle title='Contact Details' />

        <div className='grid grid-cols-4 gap-6'>
          <Info label='Center Email' value={data?.center_email} />
          <Info label='Center Phone' value={data?.center_phone} />
          <Info label='Whatsapp Number' value={data?.whatsapp_number} />
          <Info label='Contact Person' value={data?.contact_person} />
        </div>

        {/* Status & Configuration */}
        <SectionTitle title='Configuration' />

        <div className='grid grid-cols-4 gap-6'>
          <Info label='Center Status' value={data?.center_status} />
          <Info
            label='Live Class Enabled'
            value={data?.live_class_enable ? 'Yes' : 'No'}
          />
          <Info
            label='White Label Enabled'
            value={data?.white_label_enabled ? 'Yes' : 'No'}
          />
        </div>

        {/* Address */}
        <SectionTitle title='Address Details' />

        <div className='grid grid-cols-4 gap-6'>
          <Info label='Country' value={data?.address?.country} />
          <Info label='State' value={data?.address?.state} />
          <Info label='City' value={data?.address?.city} />
          <Info label='Pincode' value={data?.address?.postal_code} />
          <Info label='Address Line 1' value={data?.address?.address_line_1} />
          <Info label='Address Line 2' value={data?.address?.address_line_2} />
        </div>

        {/* Website */}
        <SectionTitle title='Website' />

        <div className='grid grid-cols-4 gap-6'>
          <Info label='Website URL' value={data?.website_url} />
          <Info label='GST Number' value={data?.gst_number} />
        </div>

        {/* Facilities */}
        {data?.facilities?.length > 0 && (
          <>
            <SectionTitle title='Facilities' />
            <div className='grid grid-cols-4 gap-4'>
              {data.facilities.map((facility, index) => (
                <div
                  key={index}
                  className='border rounded-lg px-4 py-2 text-sm bg-gray-50'
                >
                  {facility}
                </div>
              ))}
            </div>
          </>
        )}

             {/* Marketing Platforms */}
        {data?.marketing_platform?.length > 0 && (
          <>
            <SectionTitle title='Marketing Platforms' />
            <div className='grid grid-cols-4 gap-4'>
              {data.marketing_platform.map((facility, index) => (
                <div
                  key={index}
                  className='border rounded-lg px-4 py-2 text-sm bg-gray-50'
                >
                  {facility}
                </div>
              ))}
            </div>
          </>
        )}

             {/* Currently Using Digital Tools */}
        {data?.currently_using_digital_tool?.length > 0 && (
          <>
            <SectionTitle title='Currently Using Digital Tools' />
            <div className='grid grid-cols-4 gap-4'>
              {data.currently_using_digital_tool.map((facility, index) => (
                <div
                  key={index}
                  className='border rounded-lg px-4 py-2 text-sm bg-gray-50'
                >
                  {facility}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </CustomeModal>
  )
}

const Info = ({ label, value }) => (
  <div>
    <p className='text-sm text-pricing_text'>{label}</p>
    <p className='text-base mt-1'>{value || '-'}</p>
  </div>
)

const SectionTitle = ({ title }) => (
  <p className='text-md font-medium text-textblack mt-4'>{title}</p>
)

export default ViewCenterInfo
