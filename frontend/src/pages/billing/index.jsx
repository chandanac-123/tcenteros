import ContentLayout from '@common/masterLayout/ContentLayout'
import { useState } from 'react'
import CustomeTab from '@common/CustomeTab'
import LineChart from '@common/charts/LineChart'
import CustomDatePicker from '@common/CustomeDatepicker'
import { Card } from '@pages/components/ui/card'
import StatusDisplayCard from './component/statusDisplayCard'
import DisplayActionCard from './component/displayActionCard'

const billingContent = [
  { id: 1, name: 'Overview' },
  { id: 2, name: 'Sales' },
  { id: 2, name: 'Memberships' },
  { id: 2, name: 'Network' },
  { id: 2, name: 'Settlements' },
  { id: 2, name: 'Reports' }
]
const Billing = () => {
  const [activeTab, setActiveTab] = useState('Overview')
  return (
    <ContentLayout>
      <div className=' w-full space-y-4'>
        <div className='text-xl font-semibold text-textblack mb-4'>
          Billing / Overview
        </div>
        <CustomeTab
          tabList={billingContent}
          defaultVal='Overview'
          tabsListClass='p-[1px]'
          onChange={value => setActiveTab(value)}
        />
        <div className='flex w-full'>
          <StatusDisplayCard />
        </div>

        <div className='flex flex-col lg:flex-row w-full gap-4 items-stretch'>
          {/* Left Section */}
          <div className='w-2/3'>
            <Card className='p-4 h-full'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
                <span className='font-semibold text-base'>
                  Total Revenue Summary
                </span>
                <span>
                  <CustomDatePicker pickerType='year' />
                </span>
              </div>
              <LineChart />
            </Card>
          </div>

          {/* Right Section */}
          <div className='w-full lg:w-1/3'>
            <DisplayActionCard />
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}
export default Billing
