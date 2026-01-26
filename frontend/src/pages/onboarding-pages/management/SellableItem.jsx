import { Button } from "@pages/components/ui/button"
import logo from '@assets/images/logo.svg'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'

const SellableItem = () => {
  return (
        <SecondaryLayout>
      {/* Header */}
      <header className='flex items-center justify-between px-4 sm:px-10 py-5 '>
        {/* Left Logo */}
        <div className='flex items-center gap-2'>
          <img src={logo} alt='Logo' className=' w-auto' />
        </div>
      </header>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}>
          Back
        </Button>
        <Button
          variant='outline_primary'
          size='default'
          rightIcon={rightcolorarrow}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}
export default SellableItem
