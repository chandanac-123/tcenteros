import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeTab from '@common/CustomeTab'
import { Button } from '@pages/components/ui/button'
import memberimg from '@assets/dummy/member.png'
import tick from '@assets/form-icons/tick.svg'
import edit from '@assets/form-icons/edit.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import DeleteModal from '@common/CustomeDelete'

const MembershipPlan = () => {
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const employeeOrCenter = [
    { id: 1, name: 'All' },
    { id: 2, name: 'Active' },
    { id: 3, name: 'Inactive' }
  ]
  return (
    <ContentLayout>
      <div className='font-medium text-2xl'> Available Membership Plans</div>
      <div className='flex justify-between items-center my-4'>
        <div>
          <CustomeTab
            tabList={employeeOrCenter}
            defaultVal='All'
            tabsListClass='inline-flex h-10 w-[400px] p-[1px] overflow-hidden bg-transparent border-none outline-none'
            tabsTriggerClass='text-textblack rounded-2xl border-none outline-none focus:outline-none focus:border-none w-1/3 min-w-[120px] data-[state=inactive]:bg-transparent data-[state=active]:bg-white data-[state=active]:text-black justify-center'
            tabsClass='bg-tab_bg  rounded-2xl border-none outline-none'
          />
        </div>
        <div className='flex'>
          <Button size='addbutton' onClick={() => navigate('/membership-form')}>
            {' '}
            + Create New Plan
          </Button>
        </div>
      </div>

      <div className='w-full flex border border-primary  rounded-lg px-3 py-5 justify-between items-center gap-2'>
        <div>
          <img src={memberimg} alt='Member' className='w-40 h-40' />
        </div>

        <div className='flex flex-col gap-4'>
          <span className='text-primary font-semibold text-xl'>Base Plan</span>
          <div className='flex flex-col'>
            <span className='text-grey_text text-sm'>membership id</span>
            <span className='text-primary_light font-medium text-lg'>
              8744544
            </span>
          </div>
          <div className='flex justify-center items-center gap-2'>
            <span className='font-semibold'>₹5999 /</span>
            <span className='font-thin text-xs text-grey_text justify-center'>
              3 months
            </span>
          </div>
        </div>

        <div className='w-80 text-sm text-left text-grey_text'>
          Experience exclusive access to personal training sessions, advanced
          nutrition plans, and priority support. Elevate your fitness journey
          with customized strategies tailored specifically to your needs.
        </div>

        <div className='flex flex-col gap-2'>
          <div className='flex gap-1 justify-center text-sm items-center'>
            <img src={tick} alt='Tick' className='w-3 ' />
            <span className='text-sm text-pricing_text'>
              Dedicated Nutrition App (iOS & Android)
            </span>
          </div>
          <div className='flex gap-1 justify-center text-sm items-center'>
            <img src={tick} alt='Tick' className='w-3 ' />
            <span className='text-sm text-pricing_text'>
              Dedicated Nutrition App (iOS & Android)
            </span>
          </div>
          <div className='flex gap-1 justify-center text-sm items-center'>
            <img src={tick} alt='Tick' className='w-3 ' />
            <span className='text-sm text-pricing_text'>
              Dedicated Nutrition App (iOS & Android)
            </span>
          </div>
        </div>

        <div className='flex flex-col gap-4 justify-end items-end'>
          <div className='flex gap-4 justify-center'>
            <span className='text-pricing_text text-sm'>Active</span>
            <Switch />
          </div>

          <div className='flex gap-4 justify-center items-center'>
            <span className='text-pricing_text text-sm'>Edit</span>
            <button>
              <img src={edit} alt='delete' className='w-8' />
            </button>
          </div>

          <div className='flex gap-4 justify-center items-center'>
            <span className='text-pricing_text text-sm'>Delete</span>

            <button onClick={() => setDeleteOpen(!deleteOpen)}>
              <img src={deleteicon} alt='delete' className='w-8' />
            </button>
          </div>
        </div>
      </div>
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header='Are you sure you want to delete this plan?'
        description='This plan will be removed from your active offerings and new members wont be able to purchase it. This action cannot be undone.'
      />
    </ContentLayout>
  )
}
export default MembershipPlan
