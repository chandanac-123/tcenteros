import PartnerLayout from './components/Layout'
import HeaderProgress from './components/HaederProgress'

const Payment = () => {
  return (
    <PartnerLayout>
      <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-4">
        <HeaderProgress currentStep={3} />
      
    </div>
    </PartnerLayout>
  )
}

export default Payment
