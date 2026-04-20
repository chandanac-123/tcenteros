import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/components/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import deleteicon from '@assets/form-icons/delete.svg'
import { Minus, Plus } from 'lucide-react'
import {
  useCreateCartMutation,
  useCartAmountQuery,
  useCheckoutCartMutation,
  useDeleteCartMutation,
  useUpdateCartMutation
} from '@api-queries/center-admin/billing/Query'
import { useProductDropdownQuery } from '@api-queries/center-admin/inventory/Query'
import { useFormik } from 'formik'
import { useCartStore } from '@store/cartStore'
import AddProductModal from '@pages/iventories/components/AddProductModal'
import { useState } from 'react'

const paymentMethod = [
  { id: 'cash', name: 'Cash' },
  { id: 'upi', name: 'UPI' }
]

const NewSale = ({ saleOpen, setSaleOpen }) => {
  const [open, setOpen] = useState(false)
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
    quantity: null
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
      data: { quantity: Number(nextQuantity) }
    })
  }

  const handleRemoveItem = async id => {
    if (!id) return
    await removeCartItem(id)
  }

  return (
    <CustomeModal open={saleOpen} onOpenChange={setSaleOpen} header='Add Cart'>
      <form
  className='flex flex-col gap-4 w-full'
  id='cart-add'
  onSubmit={formik.handleSubmit}
>
  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
    <div>
      {productDropdownData?.products?.length === 0 ||
      productDropdownData === undefined ? (
        <div className='flex flex-col gap-2 border border-dashed rounded-lg p-3 bg-primary/5'>
          <p className='text-sm text-gray-600'>
            No product found. Please add a product.
          </p>
          <Button
            size='addbutton'
            type='button'
            onClick={() => setOpen(true)}
          >
            + Add Product
          </Button>
          <AddProductModal open={open} setOpen={setOpen} />
        </div>
      ) : (
        <CustomeSelect
          label='Product Name'
          name='product_id'
          placeholder='Select Product'
          options={productDropdownData?.products || []}
          value={formik.values.product_id}
          onChange={value => formik.setFieldValue('product_id', value)}
        />
      )}
    </div>

    <Input
      label='Quantity'
      name='quantity'
      placeholder='Enter quantity'
      value={formik.values.quantity}
      onChange={e => formik.setFieldValue('quantity', e.target.value)}
    />
  </div>

  <div className='flex justify-end'>
    <Button size='addbutton' variant='outline_primary' type='submit'>
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
