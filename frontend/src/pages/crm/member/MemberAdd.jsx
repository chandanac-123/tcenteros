import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import CustomeBreadcrumb from '@common/CustomeBreadcrumb'
import CustomeTab from '@common/CustomeTab'

const MemberAdd = ({ memberId, isEdit, goBack }) => {
  const paidStatus = [
    { id: 'paid', name: 'Paid' },
    { id: 'unpaid', name: 'Unpaid' }
  ]
  return (
    <div className='flex flex-col gap-4 pb-6'>
      <CustomeBreadcrumb
        goBack={goBack}
        buttonName='Members Listing'
        currentPageName='Member creation form'
      />
      <form className='space-y-2'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input label='Full Name' name='full_name' />
          </div>
          <div className='flex-1'>
            <Input label='Email ID' name='email' />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input label='Mobile Number' name='mobile' type='number' />
          </div>
          <div className='flex-1'>
            <CustomeSelect label='Gender' name='center_id' />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input label='Date of Birth' name='state' />
          </div>
          <div className='flex-1'>
            <Input label='Blood Group' name='city' />
          </div>
        </div>

        <div className='flex-1'>
          <Input label='Address' name='pin' />
        </div>
        <div className='flex gap-4 '>
          <div className='flex-1'>
            <Input label='City' name='pin' />
          </div>
          <div className='flex-1'>
            <Input label='State' name='address' />
          </div>
        </div>
        <div className='flex gap-4 '>
          <div className='flex-1'>
            <Input label='Country' name='country' />
          </div>
          <div className='flex-1'>
            <Input label='Pin' name='country' />
          </div>
        </div>
        <div className='flex gap-4 '>
          <div className='flex-1'>
            <CustomeSelect label='Membership Plan ' name='center_id' />
          </div>
          <div className='flex-1'>
            <CustomeSelect label='Payment Method' name='center_id' />
          </div>
        </div>
        <div className='flex gap-4 '>
          <div className='flex-1'>
            <CustomeSelect label='Membership Status ' name='center_id' />
          </div>
          <div className='flex-1'>
            <CustomeSelect label='Set Password' name='center_id' />
          </div>
        </div>

        <div className='flex justify-end'>
          <CustomeTab
            tabList={paidStatus}
            defaultVal='unpaid'
            tabsListClass='w-40 p-[1px] rounded-full'
            tabsTriggerClass='rounded-full'
          />
        </div>

        <div className='flex justify-start mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            {isEdit ? 'Update Member' : 'Create Member'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default MemberAdd
