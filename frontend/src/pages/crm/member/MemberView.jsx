import { Button } from '@pages/components/ui/button'
import CustomeBreadcrumb from '@common/components/CustomeBreadcrumb'
import { useMembersGetByIdQuery } from '@api-queries/center-admin/crm/Query'
import { convertTo12Hour } from '@utils/helper'

const MemberView = ({ goBack, memberId }) => {
  const { data: memberData } = useMembersGetByIdQuery(memberId)
  return (
    <div className='flex gap-3 flex-col pb-6'>
      <CustomeBreadcrumb
        goBack={goBack}
        buttonName='Members Listing'
        currentPageName='Member Details'
      />
      <span className='text-base font-semibold'>Basic Information</span>
      <div className='flex border border-tableborder p-4 rounded-xl'>
        <div className='flex gap-3 justify-between w-full'>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Member Name</span>
            <span>{memberData?.full_name}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Gender</span>
            <span>{memberData?.gender}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Date Of Birth</span>
            <span>{memberData?.date_of_birth}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Blood Group</span>
            <span>{memberData?.blood_group}</span>
          </div>
        </div>
      </div>

      <span className='text-base font-semibold'>Contact Information</span>
      <div className='flex border border-tableborder p-4 rounded-xl'>
        <div className='flex gap-16'>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Email </span>
            <span>{memberData?.email}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Phone Number</span>
            <span>{memberData?.mobile}</span>
          </div>
        </div>
      </div>

      <span className='text-base font-semibold'>Address</span>
      <div className='flex border border-tableborder p-4 rounded-xl'>
        <div className='flex gap-3 justify-between w-full'>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Address</span>
            <span>{memberData?.address?.address_line_1}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>City</span>
            <span>{memberData?.address?.city}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>State</span>
            <span>{memberData?.address?.state}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Country</span>
            <span>{memberData?.address?.country}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Pin Code</span>
            <span>{memberData?.address?.postal_code}</span>
          </div>
        </div>
      </div>

      <span className='text-base font-semibold'>Membership Details</span>
      <div className='flex border border-tableborder justify-between p-4 rounded-xl'>
        <div className='flex gap-16'>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Membership Plan</span>
            <span>{memberData?.membership_id}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Time Slot</span>
            <span>
              {convertTo12Hour(memberData?.time_slot?.start_time)} -{' '}
              {convertTo12Hour(memberData?.time_slot?.end_time)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberView
