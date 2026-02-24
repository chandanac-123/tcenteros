import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeTab from '@common/CustomeTab'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'
import DeleteModal from '@common/CustomeDelete'
import CreateMembershipForm from './CreateForm'
import PlanCard from './PlanCard'
import { CarouselSize } from '@common/CustomeCarousel'
import { membershipPlanColorPalette } from '@constants/membership-color-palette'
import { usePlansQuery } from '@api-queries/membership-plan/Query'
import { Spinner } from '@pages/components/ui/spinner'

const MembershipPlan = () => {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const { data, isFetching } = usePlansQuery()
  // console.log('data: ', data);
  const employeeOrCenter = [
    { id: 1, name: 'All' },
    { id: 2, name: 'Active' },
    { id: 3, name: 'Inactive' }
  ]

  return (
    <ContentLayout>
      <div className='text-xl font-semibold text-textblack'>
        {' '}
        Available Membership Plans
      </div>
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
      {isFetching ? (
        <div className='flex justify-center items-center py-10'>
          <Spinner />
        </div>
      ) : (
        <CarouselSize>
          {data?.map((plan, index) => (
            <PlanCard
              key={index}
              data={plan}
              colors={
                membershipPlanColorPalette[
                  index % membershipPlanColorPalette.length
                ]
              }
            />
          ))}
        </CarouselSize>
      )}

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
