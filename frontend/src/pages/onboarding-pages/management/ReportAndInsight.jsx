import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/navigate-icons/rightcolorarrow.svg'
import OnboardProgress from '../components/OnboardProgress'
import OnboardHeader from '../components/OnboardHeader'
import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import { reportsAndInsight } from '@constants/reportAndInsight'
import { useEffect } from 'react'
import ReportSelectionCard from '../components/ReportSelectionCard'
import { useOnboardingStore } from '@store/onboardingStore'
import { useNavigate } from 'react-router-dom'

const ReportAndInsight = () => {
  const navigate = useNavigate()
  const { setTool, reportAndInsight, setReportAndInsight } =
    useOnboardingStore()

  useEffect(() => {
    if (
      reportAndInsight === 'basic-report' ||
      reportAndInsight === 'detail-report'
    ) {
      setTool('reports', true)
    }
  }, [reportAndInsight, setTool])

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress step={3} total={5} value={80} />

      <div className='flex justify-center px-4 sm:px-10 mt-5'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-auto'>
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
            {reportsAndInsight.map(item => (
              <ReportSelectionCard
                key={item.id}
                item={item}
                selected={reportAndInsight === item.id}
                onSelect={setReportAndInsight}
              />
            ))}
          </div>
        </div>
      </div>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6'>
        <Button
          variant='outline_secondary'
          size='sm'
          leftIcon={backarrow}
          onClick={() => navigate('/digital-presence')}
        >
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
