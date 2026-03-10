import CustomeModal from '@common/CustomeModal'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import deleteicon from '@assets/form-icons/delete.svg'
import { Minus, Plus } from 'lucide-react'
import {
  useCreateCartMutation,
  useCartAmountQuery,
  useCheckoutCartMutation,
  useDeleteCartMutation,
  useUpdateCartMutation
} from '@api-queries/billing/Query'
import { useProductDropdownQuery } from '@api-queries/inventory/Query'
import { useFormik } from 'formik'
import { useCartStore } from '@store/cartStore'

const paymentMethod = [
  { id: 'cash', name: 'Cash' },
  { id: 'upi', name: 'UPI' }
]

const NewSale = ({ saleOpen, setSaleOpen }) => {
  const { mutateAsync: addToCart } = useCreateCartMutation()
  const { mutateAsync: checkoutCart } = useCheckoutCartMutation()
  const { mutateAsync: updateCartItem, isPending: isUpdatingCart } =
    useUpdateCartMutation()
  const { mutateAsync: removeCartItem, isPending: isRemovingCart } =
    useDeleteCartMutation()
  const { data: productDropdownData } = useProductDropdownQuery()
  const { openedCartResponse } = useCartStore()
  const { data: cartAmount } = useCartAmountQuery(openedCartResponse?.cart_id)

  const initialValues = {
    product_id: '',
    quantity: ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        await addToCart({ details: values, id: openedCartResponse?.cart_id })
        formik.resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const checkoutFormik = useFormik({
    initialValues: {
      method: ''
    },
    onSubmit: async values => {
      try {
        const payload = {
          cart_id: openedCartResponse?.cart_id,
          payment: {
            amount: cartAmount?.total || 0,
            method: values.method
          }
        }
        await checkoutCart(payload)
        checkoutFormik.resetForm()
        setSaleOpen(false)
      } catch (error) {
        console.error(error)
      }
    }
  })

  const getCartItemId = product => product?.cart_item_id

  const handleQuantityChange = async (product, delta) => {
    const itemId = getCartItemId(product)
    if (!itemId) return
    const currentQuantity = Number(product?.quantity || 1)
    const nextQuantity = Math.max(1, currentQuantity + delta)
    if (nextQuantity === currentQuantity) return
    await updateCartItem({
      id: itemId,
      data: { quantity: nextQuantity }
    })
  }

  const handleRemoveItem = async id => {
    if (!id) return
    await removeCartItem(id)
  }

  return (
    <CustomeModal open={saleOpen} onOpenChange={setSaleOpen} header='Add Cart'>
      <form
        className='flex flex-col gap-4 lg:w-96 w-full'
        id='cart-add'
        onSubmit={formik.handleSubmit}
      >
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomeSelect
              label='Product Name'
              name='product_id'
              placeholder='Enter'
              options={productDropdownData?.products || []}
              value={formik.values.product_id}
              onChange={value => formik.setFieldValue('product_id', value)}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Stock Quantity'
              name='quantity'
              placeholder='Enter'
              value={formik.values.quantity}
              onChange={e => formik.setFieldValue('quantity', e.target.value)}
            />
          </div>
        </div>

        <div className='flex justify-end mt-2'>
          <Button
            size='addbutton'
            variant='outline_primary'
            type='submit'
            form='cart-add'
          >
            Add To Cart
          </Button>
        </div>
      </form>
      {cartAmount?.products?.map(product => {
        console.log('product: ', product)
        return (
          <div
            key={getCartItemId(product) || product?.product_id}
            className='flex flex-col bg-white gap-2 border border-tableborder rounded-lg p-4'
          >
            <div className='flex justify-between'>
              <span className='text-xs text-pricing_text'>Product name</span>
              <span className='text-xs'>{product?.product_name}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-xs text-pricing_text'>Unit Price</span>
              <span className='text-xs'>₹{product?.unit_price || 0}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-xs text-pricing_text'>Quantity</span>
              <div className='flex items-center border border-tableborder rounded-lg overflow-hidden'>
                <button
                  type='button'
                  className='p-1 hover:bg-gray-100'
                  disabled={isUpdatingCart || isRemovingCart}
                  onClick={() => handleQuantityChange(product, -1)}
                >
                  <Minus className='text-secondary w-4 h-4' />
                </button>
                <span className='px-2 text-sm font-medium'>
                  {product?.quantity || 0}
                </span>
                <button
                  type='button'
                  className='p-1 hover:bg-gray-100'
                  disabled={isUpdatingCart || isRemovingCart}
                  onClick={() => handleQuantityChange(product, 1)}
                >
                  <Plus className='text-secondary w-4 h-4' />
                </button>
              </div>
            </div>
            <div className='flex justify-between'>
              <span className='text-xs text-pricing_text'>Total</span>
              <span className='text-xs'>₹{product?.line_total || 0}</span>
            </div>
            <button
              className='flex justify-end'
              type='button'
              disabled={isUpdatingCart || isRemovingCart}
              onClick={() => handleRemoveItem(product?.cart_item_id)}
            >
              <img src={deleteicon} alt='delete' className='w-6' />
            </button>
          </div>
        )
      })}

      <form
        className='flex flex-col gap-4'
        id='checkout-form'
        onSubmit={checkoutFormik.handleSubmit}
      >
        <div className='flex flex-col border border-tableborder rounded-lg p-4 gap-2'>
          <span>Price Details ({cartAmount?.items_count || 0} Items)</span>
          <div className='flex justify-between'>
            <span className='text-xs'>Tax</span>
            <span className='text-xs'>{cartAmount?.tax || 0}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-xs'>Total Product Price</span>
            <span className='text-xs'>{cartAmount?.subtotal || 0}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-xs'>Total</span>
            <span className='text-xs'>{cartAmount?.total || 0}</span>
          </div>
        </div>
        <div className='flex flex-col border border-tableborder rounded-lg p-4 gap-2'>
          <CustomeSelect
            label='Pyament Method'
            name='full_name'
            placeholder='Select Payment Method'
            options={paymentMethod}
            value={checkoutFormik.values.method}
            onChange={value => checkoutFormik.setFieldValue('method', value)}
          />
        </div>
        <div className='flex justify-end mt-4 '>
          <Button
            size='addbutton'
            variant='default'
            type='submit'
            id='checkout-button'
            disabled={!checkoutFormik.values.method}
          >
            Proceed To Checkout
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default NewSale
