import logo from '@assets/images/logo.svg'
const Invoice = () => {
  return (
    <div class=' bg-white p-10 font-sans text-gray-800'>
      {/* <!-- Header --> */}
      <div class='flex items-start justify-between'>
        {/* <!-- Logo --> */}
        <div class='flex items-center gap-2'>
          <img src={logo} alt='Logo' />
        </div>

        {/* <!-- Invoice Meta --> */}
        <div class='text-right text-sm'>
          <p class='font-medium text-gray-500'>
            Invoice id : <span class='font-bold text-textblack'>#848904</span>
          </p>
          <p class='text-gray-500 font-medium'>
            Date : <span class=' text-textblack'>Jan 22, 2026, 11:45 am</span>
          </p>
        </div>
      </div>

      {/* <!-- Center Details --> */}
      <div class='mt-10 grid grid-cols-2 gap-y-2 text-sm max-w-md'>
        <h2 class='col-span-2 mb-2 text-base font-semibold'>Center Details</h2>

        <p class='text-gray-500'>Center Name</p>
        <p class='font-medium'>Fitrex</p>

        <p class='text-gray-500'>Contact Number</p>
        <p class='font-medium'>+91 9876543210</p>

        <p class='text-gray-500'>Address</p>
        <p class='font-medium'>
          Plot no 04, behind DAV Public School, Katol Road, Nagpur
        </p>

        <p class='text-gray-500'>Pincode</p>
        <p class='font-medium'>441501</p>

        <p class='text-gray-500'>GST Number</p>
        <p class='font-medium'>GST441501</p>
      </div>

      {/* <!-- Billing Summary Card --> */}
      <div class='mt-4 flex justify-center'>
        <div class='w-full max-w-xl rounded-2xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)]'>
          <h3 class='mb-6 text-center text-lg font-semibold'>
            Billing Summary
          </h3>

          {/* <!-- Package --> */}
          <div class='flex justify-between text-sm'>
            <div>
              <p class='font-medium text-textblack'>Package Details</p>
              <p class='mt-1 text-gray-500'>
                White-Label Offline + Live Classes package (1 year)
              </p>
            </div>
            <p class='font-medium'>₹24,900.00</p>
          </div>

          {/* <!-- Divider --> */}
          <div class='my-5 border-t border-gray-200'></div>
          <p class='font-medium text-textblack'>Detailed Bill Breakdown</p>
          {/* <!-- Breakdown --> */}
          <div class='space-y-3 text-sm'>
            <div class='flex justify-between'>
              <p class='text-gray-500'>Base price (1 year)</p>
              <p class='font-medium'>₹24,900.00</p>
            </div>

            <div class='flex justify-between'>
              <p class='text-gray-500'>GST (18%)</p>
              <p class='font-medium'>₹4,482.00</p>
            </div>
          </div>

          {/* <!-- Total --> */}
          <div class='mt-6 flex justify-between items-end'>
            <p class='font-semibold text-textblack'>Total Amount Payable</p>
            <div>
              <p class='text-xl font-bold text-purple-600'>₹29,382.00</p>
              <p class='text-xs text-gray-400'>(Include all payable taxes)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoice
