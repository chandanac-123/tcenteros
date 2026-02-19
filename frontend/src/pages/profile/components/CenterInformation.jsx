import profile from '@assets/dummy/profile.png'
import profile_edit from '@assets/form-icons/profile-edit.svg'
import { Button } from '@pages/components/ui/button'
import EditCenterInformation from './EditCenterInfo'
import { useState } from 'react'
import { CustomeCollapse } from '@common/CustomeCollapse'

const CenterInformation = () => {
  const [open, setOpen] = useState(false)

  const dummyCenterData = [
    {
      name: 'Power Gym',
      category: 'Premium Fitness',
      code: 'GYM001',
      email: 'powergym@email.com',
      phone: '+91 9876543210',
      country: 'India',
      state: 'Kerala',
      city: 'Kochi',
      pincode: '682019',
      address1: 'MG Road',
      address2: 'Galaxy Tower ',
      description: 'Premium fitness center with modern equipment.'
    },
    {
      name: 'Elite Gym',
      category: 'Standard Fitness',
      code: 'GYM002',
      email: 'elite@email.com',
      phone: '+91 9123456789',
      country: 'India',
      state: 'Tamil Nadu',
      city: 'Chennai',
      pincode: '600001',
      address1: 'Anna Salai',
      address2: 'Sky Plaza',
      description: 'Affordable fitness center with good facilities.'
    }
  ]

  const firstCenter = dummyCenterData[0]
  const remainingCenters = dummyCenterData.slice(1)

  const renderCard = (data, index) => (
    <div
      key={index}
      className='border border-tableborder rounded-2xl p-4 relative mb-4'
    >
      <div className='absolute top-6 right-6'>
        <Button
          onClick={() => setOpen(true)}
          variant='button_filter'
          rightIcon={profile_edit}
          size='editbutton'
        >
          Edit
        </Button>
      </div>
      <div className='flex items-center gap-6 mb-4'>
        <img
          src={profile}
          alt='Center'
          className='w-20 h-20 rounded-md object-cover'
        />
        <div className='flex gap-8 w-full'>
          <div>
            <p className='text-pricing_text text-sm'>Center Name</p>
            <p className='text-textblack text-base'>{data.name}</p>
          </div>
          <div>
            <p className='text-pricing_text text-sm'>Center Category</p>
            <p className='text-textblack text-base'>{data.category}</p>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-3 gap-y-2 gap-x-6'>
        <InfoItem label='Center Code' value={data.code} />
        <InfoItem label='Email address' value={data.email} />
        <InfoItem label='Phone' value={data.phone} />
        <InfoItem label='Country' value={data.country} />
        <InfoItem label='State' value={data.state} />
        <InfoItem label='City' value={data.city} />
        <InfoItem label='Pincode' value={data.pincode} />
        <InfoItem label='Address 1' value={data.address1} />
        <InfoItem label='Address 2' value={data.address2} />
      </div>
      <div className='mt-4'>
        <p className='text-pricing_text text-sm'>Center description</p>
        <p className='text-textblack text-base mt-2'>{data.description}</p>
      </div>
    </div>
  )

  return (
    <div className='flex flex-col p-2'>
      <span className='text-lg font-semibold mb-4'>Center Information</span>
      {/* Always show first center */}
      {firstCenter && renderCard(firstCenter, 0)}
      {/* If more than one center, show rest inside collapse */}
      {remainingCenters.length > 0 && (
        <CustomeCollapse label='More Centers'>
          {remainingCenters.map((center, index) =>
            renderCard(center, index + 1)
          )}
        </CustomeCollapse>
      )}
      <EditCenterInformation open={open} setOpen={setOpen} />
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
