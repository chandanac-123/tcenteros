import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import backarrow from '@assets/images/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'

const InvoiceSummary = () => {
  return (
    <SecondaryLayout>
      <OnboardHeader />

      <div className='flex justify-center px-4 sm:px-10'>
        <div className='bg-white rounded-3xl shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] p-8 w-full max-w-lg  '>
          {/* Header */}
          <h2 className='text-xl font-semibold text-center mb-6'>
            Billing Summary
          </h2>

          {/* Center Details */}
          <section className='mb-6'>
            <h3 className='font-semibold mb-3'>Center Details</h3>

            <div className='space-y-1 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Center Name</span>
                <span className='font-medium'>Fitrex</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-gray-500'>Contact</span>
                <span className='font-medium'>+91 9876543210</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-gray-500'>City</span>
                <span className='font-medium'>Kochi</span>
              </div>
            </div>

            {/* Address */}
            <div className='mt-4'>
              <label className='text-sm font-medium'>Address</label>
              <input
                disabled
                value='Plot no 04, behind DAV Public School, Katol Road, Nagpur'
                className='mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-600'
              />
            </div>

            {/* Pincode */}
            <div className='mt-3'>
              <label className='text-sm font-medium'>Pincode</label>
              <input
                disabled
                value='441501'
                className='mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-600'
              />
            </div>

            {/* GST */}
            <div className='mt-2'>
              <label className='text-sm font-medium'>
                GST NO <span className='text-gray-400'>(Optional)</span>
              </label>
              <input
                disabled
                value='GST441501'
                className='mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-600'
              />
            </div>
          </section>

          {/* Package Details */}
          <section className='mb-2'>
            <h3 className='font-semibold mb-1'>Package Details</h3>

            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>
                White-Label Offline + Live Classes package (1 year)
              </span>
              <span className='font-medium'>₹24,900.00</span>
            </div>
          </section>

          {/* Bill Breakdown */}
          <section className='mb-6'>
            <h3 className='font-semibold mb-1'>Detailed Bill Breakdown</h3>

            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Base price (1 year)</span>
                <span>₹24,900.00</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-gray-600'>GST (18%)</span>
                <span>₹4,482.00</span>
              </div>
            </div>
          </section>

          {/* Total */}
          <div className='flex justify-between items-end mb-8'>
            <div>
              <p className='font-semibold'>Total Amount Payable</p>
              <p className='text-xs text-gray-400'>
                (Include all payable taxes)
              </p>
            </div>
            <p className='text-2xl font-bold text-purple-600'>
              ₹29,382.00
            </p>
          </div>

          {/* Actions */}
          <div className='flex gap-3'>
            <Button
              variant='button_outlined'
              className='w-1/2'
              size="sm"
            >
              Back
            </Button>

            <Button
              variant='button_filled'
              className='w-1/2'
              size="sm"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Back Button */}
      <div className='mt-6'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}>
          Back
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default InvoiceSummary
