import LineChart from '@common/charts/LineChart'
import CustomDatePicker from '@common/CustomeDatepicker'
import StatusDisplayCard from './statusDisplayCard'
import { Card } from '@pages/components/ui/card'
import DisplayActionCard from './displayActionCard'

const Overview = () => {
  return (
    <div>
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
  )
}
export default Overview
