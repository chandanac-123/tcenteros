import CustomeModal from '@common/CustomeModal'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import deleteicon from '@assets/form-icons/delete.svg'
import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

const NewSale = ({ saleOpen, setSaleOpen }) => {
  const [quantity, setQuantity] = useState(1)
  return (
    <CustomeModal open={saleOpen} onOpenChange={setSaleOpen} header='Add Cart'>
      <form className='flex flex-col gap-4 lg:w-96 w-full'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomeSelect
              label='Product Name'
              name='full_name'
              placeholder='Enter'
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Price'
              name='email'
              placeholder='Enter Your Email ID'
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomeSelect
              label='Stock Quantity'
              name='full_name'
              placeholder='Enter'
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Total Cost'
              name='email'
              placeholder='Enter Your Email ID'
            />
          </div>
        </div>
        <div className='flex justify-end mt-2'>
          <Button size='addbutton' variant='outline_primary' type='button'>
            Add To Cart
          </Button>
        </div>
        <div className='flex flex-col bg-white gap-2 border border-tableborder rounded-lg p-4'>
          <div className='flex justify-between'>
            <span className='text-xs text-pricing_text'>Product name</span>
            <span className='text-xs'>Protein</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-xs text-pricing_text'>Quantity</span>
            <div className='flex items-center border border-tableborder rounded-lg overflow-hidden'>
              <button
                type='button'
                className='p-1 hover:bg-gray-100'
                onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
              >
                <Minus className='text-secondary w-4 h-4' />
              </button>
              <span className='px-2 text-sm font-medium'>{quantity}</span>
              <button
                type='button'
                className='p-1 hover:bg-gray-100'
                onClick={() => setQuantity(prev => prev + 1)}
              >
                <Plus className='text-secondary w-4 h-4' />
              </button>
            </div>
          </div>
          <div className='flex justify-between'>
            <span className='text-xs text-pricing_text'>Total</span>
            <span className='text-xs'>₹2500</span>
          </div>
          <button className='flex justify-end' type='button'>
            <img src={deleteicon} alt='delete' className='w-6' />
          </button>
        </div>
      </form>
      <form className='flex flex-col gap-4' id='checkout-form'>
        <div className='flex flex-col border border-tableborder rounded-lg p-4 gap-2'>
          <span>Price Details (2 Items)</span>
          <div className='flex justify-between'>
            <span className='text-xs'>Tax</span>
            <span className='text-xs'>Cart Summary</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-xs'>Total Product Price</span>
            <span className='text-xs'>Cart Summary</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-xs'>Total</span>
            <span className='text-xs'>Cart Summary</span>
          </div>
        </div>
        <div className='flex flex-col border border-tableborder rounded-lg p-4 gap-2'>
          <CustomeSelect
            label='Pyament Method'
            name='full_name'
            placeholder='Select Payment Method'
          />
        </div>
        <div className='flex justify-end mt-4 '>
          <Button size='addbutton' variant='default' type='submit' id='checkout-button'>
            Proceed To Checkout
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default NewSale
