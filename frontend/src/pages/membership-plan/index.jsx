import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeTab from '@common/components/CustomeTab'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'
import DeleteModal from '@common/components/CustomeDelete'
import CreateMembershipForm from './CreateForm'
import PlanCard from './PlanCard'
import { CarouselSize } from '@common/components/CustomeCarousel'
import { membershipPlanColorPalette } from '@constants/membership-color-palette'
import { usePlansQuery } from '@api-queries/membership-plan/Query'
import { Spinner } from '@pages/components/ui/spinner'
import { useLocation } from 'react-router-dom'

const MembershipPlan = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialTab = queryParams.get('tab') || 'all'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const { data, isFetching } = usePlansQuery(activeTab)

  const Status = [
    { id: 'all', name: 'All' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' }
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
            tabList={Status}
            defaultVal={initialTab}
            tabsListClass=' w-[400px] p-[1px]'
            onChange={value => setActiveTab(value)}
          />
        </div>
        <Button size='addbutton' onClick={() => setOpen(true)}>
          {' '}
          + Create New Plan
        </Button>
      </div>
      {data?.length === 0 && (
        <p className='flex justify-center items-center font-semibold font-poppins'>
          NO MORE PLANS AVAILABLE
        </p>
      )}
      {data?.length > 0 && (
        <div>
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
        </div>
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
