import profile from '@assets/dummy/profile.png'
import profile_edit from '@assets/form-icons/profile-edit.svg'
import { Button } from '@pages/components/ui/button'
import EditCenterInformation from './EditCenterInfo'
import { useState } from 'react'
import { CustomeCollapse } from '@common/CustomeCollapse'
import view from '@assets/form-icons/view.svg'
import { useAllProfileQuery } from '@api-queries/center-profile/Query'
import ViewCenterInfo from './ViewCenterInfo'
import { useFormik } from 'formik'
import UpdateProfile from './UpdateProfile'
import { Camera } from 'lucide-react'
import { useUpdateProfileImageMutation } from '@api-queries/center-profile/Query'

const CenterInformation = () => {
  const [editId, setEditId] = useState(false)
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileId, setProfileId] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewId, setViewId] = useState(false)
  const { data, isFetching } = useAllProfileQuery()

  const branches = data?.branches || []
  const firstCenter = branches[0]
  const remainingCenters = branches.slice(1)

  const renderCard = (center, index) => (
    <div
      key={center.id}
      className='border border-tableborder rounded-2xl p-4 relative mb-4'
    >
      <div className='absolute top-6 right-6 items-center flex gap-3'>
        <Button
          onClick={() => {
            setOpen(true)
            setEditId(center.id)
          }}
          variant='button_filter'
          rightIcon={profile_edit}
          size='editbutton'
        >
          Edit
        </Button>
        <button
          onClick={() => {
            setViewOpen(true)
            setViewId(center?.id)
          }}
        >
          <img src={view} alt='view' className='w-8 h-8' />
        </button>
      </div>

      <div className='flex items-center gap-6 mb-4 '>
        <div className='relative self-center'>
          {/* Profile Image */}
          <img
            src={center.center_image_url}
            alt='User'
            className='w-20 h-20 rounded-md object-cover'
          />
          <button
            onClick={() => {
              setProfileOpen(true)
              setProfileId(center.id)
            }}
            className='absolute -right-3 bottom-0 bg-primary w-6 h-6 rounded-full flex justify-center items-center shadow-md'
          >
            <Camera size={16} className='text-white' />
          </button>
        </div>

        <div className='flex gap-8 w-full'>
          <div>
            <p className='text-pricing_text text-sm'>Center Name</p>
            <p className='text-textblack text-base'>{center.center_name}</p>
          </div>

          <div>
            <p className='text-pricing_text text-sm'>Center Category</p>
            <p className='text-textblack text-base'>
              {center.center_category_name || '-'}
            </p>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-3 gap-y-2 gap-x-6'>
        <InfoItem label='Center Code' value={center.center_email || '-'} />
        <InfoItem label='Email address' value={center.center_email || '-'} />
        <InfoItem label='Phone' value={center.center_phone || '-'} />
        <InfoItem label='Country' value={center.address?.country || '-'} />
        <InfoItem label='State' value={center.address?.state || '-'} />
        <InfoItem label='City' value={center.address?.city || '-'} />
        <InfoItem label='Pincode' value={center.address?.postal_code || '-'} />
        <InfoItem
          label='Address 1'
          value={center.address?.address_line_1 || '-'}
        />
        <InfoItem
          label='Address 2'
          value={center.address?.address_line_2 || '-'}
        />
      </div>
    </div>
  )

  return (
    <div className='flex flex-col p-2'>
      <span className='text-lg font-semibold mb-4'>Center Information</span>
      {/* Always show first center */}
      {branches.length > 0 && renderCard(firstCenter, 0)}

      {remainingCenters.length > 0 && (
        <CustomeCollapse label='More Centers'>
          {remainingCenters.map(center => renderCard(center))}
        </CustomeCollapse>
      )}
      <EditCenterInformation open={open} setOpen={setOpen} editId={editId} />
      <ViewCenterInfo open={viewOpen} setOpen={setViewOpen} viewId={viewId} />
      <UpdateProfile
        open={profileOpen}
        setOpen={setProfileOpen}
        center_edit={true}
        profileId={profileId}
      />
    </div>
  )
}

const InfoItem = ({ label, value }) => (
  <div>
    <p className='text-pricing_text text-sm'>{label}</p>
    <p className='text-textblack text-base'>{value}</p>
  </div>
)

export default CenterInformation
