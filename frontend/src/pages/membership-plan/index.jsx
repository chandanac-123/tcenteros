import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeTab from '@common/components/CustomeTab'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'
import CreateMembershipForm from './CreateForm'
import PlanCard from './PlanCard'
import { CarouselSize } from '@common/components/CustomeCarousel'
import { membershipPlanColorPalette } from '@constants/membership-color-palette'
import { usePlansQuery } from '@api-queries/membership-plan/Query'
import { Spinner } from '@pages/components/ui/spinner'
import { useLocation } from 'react-router-dom'
import { useMembershipPermissions } from '@hooks/permissions/UseMembershipPermission'

const MembershipPlan = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialTab = queryParams.get('tab') || 'all'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [open, setOpen] = useState(false)
  const { data, isFetching } = usePlansQuery(activeTab)
  const { hydrated, canAddMembership } = useMembershipPermissions()
  if (!hydrated) return null

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
        {canAddMembership && (
          <Button size='addbutton' onClick={() => setOpen(true)}>
            {' '}
            + Create New Plan
          </Button>
        )}
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
    </ContentLayout>
  )
}
export default MembershipPlan
