import { Button } from '@pages/components/ui/button'
import CustomeBreadcrumb from '@common/CustomeBreadcrumb'

const MemberView = ({ goBack }) => {
  return (
    <div className='flex gap-3 flex-col'>
      <CustomeBreadcrumb
        goBack={goBack}
        buttonName='Member Details'
        currentPageName='Basic Information'
      />
      <span className='text-base font-semibold'>Basic Information</span>
      <div className='flex border border-tableborder p-4 rounded-xl'>
        <div className='flex gap-3 justify-between w-full'>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Member Name</span>
            <span>Alex Rooney</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Gender</span>
            <span>Male</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Date Of Birth</span>
            <span>01/01/1990</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Blood Group</span>
            <span>Alex Rooney</span>
          </div>
        </div>
      </div>

      <span className='text-base font-semibold'>Contact Information</span>
      <div className='flex border border-tableborder p-4 rounded-xl'>
        <div className='flex gap-16'>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>E mail </span>
            <span>Alex@gmai.com</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Phone Number</span>
            <span>Male</span>
          </div>
        </div>
      </div>

      <span className='text-base font-semibold'>Address</span>
      <div className='flex border border-tableborder p-4 rounded-xl'>
        <div className='flex gap-3 justify-between w-full'>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Address</span>
            <span>Alex Rooney</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>City</span>
            <span>Male</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>State</span>
            <span>01/01/1990</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Country</span>
            <span>Alex Rooney</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Pin Code</span>
            <span>Alex Rooney</span>
          </div>
        </div>
      </div>

      <span className='text-base font-semibold'>Membership Details</span>
      <div className='flex border border-tableborder justify-between p-4 rounded-xl'>
        <div className='flex gap-16'>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Membership Plan</span>
            <span>Alex@gmai.com</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-pricing_text'>Time Slot</span>
            <span>Male</span>
          </div>
        </div>
        <div className='flex justify-end mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            Upgrade Plan
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MemberView
