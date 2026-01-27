import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import SecondaryLayout from '@components/onboardlayouts/SecondaryLayout'
import backarrow from '@assets/images/backarrow.svg'
import { reportAndInsight } from '@constants/reportAndInsight'
import { useState } from 'react'
import ReportSelectionCard from '../components/ReportSelectionCard'

const ReportAndInsight = () => {
  const [selectedType, setSelectedType] = useState('basic-report')
  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress step={3} total={5} value={60} />

      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-2xl rounded-lg w-auto'>
          <h2 className='font-semibold text-xl text-secondary'>
            7. Reports & Insights
          </h2>

          <p className='text-sm text-grey'>
            See attendance trends, revenue performance, trainer efficiency, and
            growth opportunities in one dashboard.
          </p>

          <p className='font-medium text-sm text-secondary'>
            Do you want detailed reports to understand how your center is
            performing?
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-1 justify-items-center'>
            {reportAndInsight.map(item => (
              <ReportSelectionCard
                key={item.id}
                item={item}
                selected={selectedType === item.id}
                onSelect={setSelectedType}
              />
            ))}
          </div>
        </div>
      </div>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}>
          Back
        </Button>
        <Button
          variant='outline_primary'
          rightIcon={rightcolorarrow}
          onClick={() => navigate('/management')}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}
export default ReportAndInsight
