import CustomeModal from '@common/components/CustomeModal'
import logo from '@assets/header-icons/logo_in_auth.svg'
import { Button } from '@pages/components/ui/button'
import { useState } from 'react'
import { useAddBranchCountMutation } from '@api-queries/branch/Query'
import { useGetBranchPricesAndTaxQuery } from '@api-queries/branch/Query'
import SuccessModal from '../message-popup/success'
import FaledModal from '../message-popup/failed'

const AddBranchModal = ({ open, onOpenChange }) => {
  const [count, setCount] = useState(1)
  const { mutateAsync: addCount, isPending } = useAddBranchCountMutation()
  const { data, isLoading } = useGetBranchPricesAndTaxQuery()
  const [openSuccess, setOpenSuccess] = useState(false)
  const [openFailed, setOpenFailed] = useState(false)

  const branchingPrice = data?.branching_price || 0
  const taxPercentage = data?.tax_percentage || 0

  // subtotal for selected branches
  const subtotal = count * branchingPrice
  // tax amount
  const taxAmount = (subtotal * taxPercentage) / 100
  // total payable
  const totalAmount = subtotal + taxAmount

  const increment = () => {
    setCount(prev => prev + 1)
  }

  const decrement = () => {
    setCount(prev => (prev > 1 ? prev - 1 : 1))
  }

  const handlePurchase = async () => {
    try {
      const payload = {
        branch_count: count
      }
      const response = await addCount(payload)
      console.log('Purchase success:', response)
      setOpenSuccess(true)
    } catch (error) {
      console.error('Purchase failed:', error)
      setOpenFailed(true)
    }
  }

  return (
    <CustomeModal open={open} onOpenChange={onOpenChange}>
      <div className='flex flex-col space-y-4 min-w-[380px]'>
        <h2 className='text-sm font-semibold'>Purchase Branches</h2>

        <div className='flex justify-between items-center'>
          <div className='flex flex-col space-y-2 py-3'>
            <p className='text-[14px] text-[#7C7C7C]'>Branch Price</p>
            <div className='flex border text-primary px-4 py-1 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] gap-3'>
              <p>Branch</p>
              <p> ₹{data?.branching_price}</p>
            </div>
          </div>
          <div className='flex flex-col space-y-2'>
            <p className='text-[14px] text-[#7C7C7C]'>No. of Branches</p>

            <div className='flex justify-around gap-1 '>
              <button
                onClick={decrement}
                className='px-3 py-1 text-lg border rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-semibold text-primary hover:bg-purple-50 transition'
              >
                −
              </button>

              <div className='px-4 py-1 flex items-center rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-semibold min-w-[40px] text-center'>
                {count}
              </div>

              <button
                onClick={increment}
                className='px-3 py-1 text-lg border rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-semibold text-primary  hover:bg-purple-50 transition'
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className='flex flex-col space-y-3'>
          <h2 className='font-semibold'>Purchase Summary</h2>
          <div className='flex justify-between items-center'>
            <p className='text-[14px] text-[#7C7C7C]'>Cost Per Branch: </p>
            <p>₹{data?.branching_price}</p>
          </div>
          <div className='flex justify-between items-center'>
            <p className='text-[14px] text-[#7C7C7C]'>Selected Branches: </p>
            <p>₹{subtotal}</p>
          </div>

          <div className='flex justify-between items-center'>
            <p className='text-[14px] text-[#7C7C7C]'>Tax</p>
            <p>₹{taxAmount}</p>
          </div>
          <hr className='border-t-2 border-gray-300' />

          <div className='flex justify-between items-center'>
            <p className='text-[14px] text-[#7C7C7C]'>Total Amount</p>
            <p className='font-semibold'>₹{totalAmount}</p>
          </div>
          <div className='py-3'>
            <Button
              variant='button_filled'
              size='sm'
              className='w-full'
              onClick={handlePurchase}
              disabled={isPending}
            >
              {isPending ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </div>
      <SuccessModal
        open={openSuccess}
        onOpenChange={setOpenSuccess}
        count={count}
      />
      <FaledModal open={openFailed} onOpenChange={setOpenFailed} />
    </CustomeModal>
  )
}

export default AddBranchModal
