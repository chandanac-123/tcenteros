import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeTab from '@common/CustomeTab'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'
import DeleteModal from '@common/CustomeDelete'
import CreateMembershipForm from './CreateForm'
import PlanCard from './PlanCard'
import { CarouselSize } from '@common/CuatomeCarousel'

const MembershipPlan = () => {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const employeeOrCenter = [
    { id: 1, name: 'All' },
    { id: 2, name: 'Active' },
    { id: 3, name: 'Inactive' }
  ]

  const colorPalette = [
    {
      bg: 'bg-plan_bg_grey',
      footer_bg: 'bg-plan_grey',
      text: 'text-plan_grey'
    },
    {
      footer_bg: 'bg-plan_green',
      bg: 'bg-plan_bg_green',
      text: 'text-plan_green'
    },
    {
      footer_bg: 'bg-plan_blue',
      bg: 'bg-plan_bg_blue',
      text: 'text-plan_blue'
    },
    {
      footer_bg: 'bg-plan_purple',
      bg: 'bg-plan_bg_purple',
      text: 'text-plan_purple'
    }
  ]

  const dummyPlans = [
    {
      title: 'Base Plan',
      price: 3999,
      duration: '3 Months',
      membershipId: '7896543',
      description:
        'Experience exclusive access to personal training sessions and advanced nutrition plans.',
      features: [
        'Dedicated Nutrition App (iOS & Android)',
        'Performance Analytics',
        'Progress Tracking',
        'Workout Insights'
      ]
    },
    {
      title: 'Base Plan',
      price: 3999,
      duration: '3 Months',
      membershipId: '7896543',
      description:
        'Experience exclusive access to personal training sessions and advanced nutrition plans.',
      features: [
        'Dedicated Nutrition App (iOS & Android)',
        'Performance Analytics',
        'Progress Tracking',
        'Workout Insights'
      ]
    },
    {
      title: 'Silver Plan',
      price: 5999,
      duration: '6 Months',
      membershipId: '4561237',
      description:
        'Enhanced features including personalized diet charts and premium support.',
      features: [
        'Premium Nutrition Plan',
        'Custom Workouts',
        'Progress Reports',
        'Priority Support'
      ]
    },
    {
      title: 'Gold Plan',
      price: 8999,
      duration: '12 Months',
      membershipId: '1122334',
      description:
        'Full access membership with unlimited sessions and AI fitness tracking.',
      features: [
        'Unlimited Sessions',
        'AI Fitness Tracking',
        'Dedicated Coach',
        'Advanced Reports'
      ]
    },
    {
      title: 'Platinum Plan',
      price: 12999,
      duration: '18 Months',
      membershipId: '4455667',
      description:
        'Ultimate experience with luxury features and complete customization.',
      features: [
        'VIP Support',
        'Fully Customized Plans',
        'Elite Analytics',
        '24/7 Assistance'
      ]
    }
  ]

  return (
    <ContentLayout>
      <div className='font-medium text-2xl'> Available Membership Plans</div>
      <div className='flex justify-between items-center my-4'>
        <div>
          <CustomeTab
            tabList={employeeOrCenter}
            defaultVal='All'
            tabsListClass=' w-[400px] p-[1px]'
          />
        </div>
        <div className='flex'>
          <Button size='addbutton' onClick={() => setOpen(true)}>
            {' '}
            + Create New Plan
          </Button>
        </div>
      </div>

      <CarouselSize>
        {dummyPlans.map((plan, index) => (
          <PlanCard
            key={index}
            {...plan}
            colors={colorPalette[index % colorPalette.length]}
          />
        ))}
      </CarouselSize>

      {/* <CarouselSize/> */}

      <CreateMembershipForm open={open} setOpen={setOpen} />
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

// tabsListClass =
//   'inline-flex h-10 w-[400px] p-[1px] overflow-hidden bg-transparent border-none outline-none'
// tabsTriggerClass =
//   'text-textblack rounded-2xl border-none outline-none focus:outline-none focus:border-none w-1/3 min-w-[120px] data-[state=inactive]:bg-transparent data-[state=active]:bg-white data-[state=active]:text-black justify-center'
// tabsClass = 'bg-tab_bg  rounded-2xl border-none outline-none'

{
  /* <div className='w-full flex border border-primary  rounded-lg px-3 py-5 justify-between items-center gap-2'>
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
      </div> */
}
