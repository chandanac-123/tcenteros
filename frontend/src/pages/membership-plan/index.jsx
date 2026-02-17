import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeTab from '@common/CustomeTab'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'
import DeleteModal from '@common/CustomeDelete'
import CreateMembershipForm from './CreateForm'
import PlanCard from './PlanCard'
import { CarouselSize } from '@common/CustomeCarousel'
import { membershipPlanColorPalette } from '@constants/membership-color-palette'


const MembershipPlan = () => {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const employeeOrCenter = [
    { id: 1, name: 'All' },
    { id: 2, name: 'Active' },
    { id: 3, name: 'Inactive' }
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
            colors={membershipPlanColorPalette[index % membershipPlanColorPalette.length]}
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