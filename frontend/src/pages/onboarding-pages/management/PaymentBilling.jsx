import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import { useOnboardingStore } from '@store/onboardingStore'
import { useNavigate } from 'react-router-dom'
import backarrow from '@assets/images/backarrow.svg'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import RadioGroup from '@common/RadioGroup'
import OnboardHeader from '../components/OnboardHeader'
import OnboardProgress from '../components/OnboardProgress'

const PaymentBilling = () => {
  const navigate = useNavigate()
  const { setTool, payment_Billing, setPaymentBilling } = useOnboardingStore()

  const handleAnswer = value => {
    setPaymentBilling(value)
    setTool('billing', value === 'yes')
  }

  return (
    <SecondaryLayout>
      <OnboardHeader />
      <OnboardProgress step={4} total={5} value={80} />
      <div className='flex w-full px-4 sm:px-10 mt-5 justify-center items-center'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-full sm:w-2/3 lg:w-1/3'>
          <span className='text-start font-semibold text-xl text-secondary justify-start flex'>
            4.Payments & Billing
          </span>
          <span className='font-normal text-sm justify-start items-start text-start flex'>
            Track membership fees, renewals, item sales, refunds, discounts, and
            expenses — so you never miss a single transaction.
          </span>
          <span className='text-start font-medium text-sm text-secondary justify-start flex'>
            Track membership fees, renewals, item sales, refunds, discounts, and
            expenses — so you never miss a single transaction.
          </span>
          <RadioGroup
            name='paymentbilling'
            options={[
              { value: 'yes', label: 'Yes, track everything' },
              { value: 'no', label: 'No, I manage accounts elsewhere' }
            ]}
            value={payment_Billing}
            onChange={handleAnswer}
          />
        </div>
      </div>
      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
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
          size='default'
          rightIcon={rightcolorarrow}
          onClick={() => navigate('/management')}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}
export default PaymentBilling
