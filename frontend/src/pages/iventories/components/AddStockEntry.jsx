import React, { useEffect, useState } from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import { useFormik } from 'formik'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import { purchaseValidationSchema } from '@utils/validations'
import {
  useCreateStockEntryMutation,
  useProductDropdownQuery
} from '@api-queries/center-admin/inventory/Query'
import { format } from 'date-fns'
import CustomeSelect from '@common/components/CustomeSelect'
import AddProductModal from './AddProductModal'

const AddStockEntry = ({ openStockEntry, setOpenStockEntry }) => {
  const [open, setOpen] = useState(false)
  const { mutateAsync: createStockEntry } = useCreateStockEntryMutation()
  const { data: productDropdownData } = useProductDropdownQuery()

  const initialValues = {
    product_id: '',
    quantity: '',
    supplier_name: '',
    invoice_number: '',
    invoice_date: '',
    cost_price: ''
  }

  const formik = useFormik({
    initialValues,
    validationSchema: purchaseValidationSchema,
    onSubmit: async values => {
      try {
        const payload = {
          ...values,
          quantity: parseInt(values.quantity, 10),
          cost_price: Number(values.cost_price || 0)
        }
        await createStockEntry(payload)
        formik.resetForm()
        setOpenStockEntry(false)
      } catch (error) {}
    }
  })

  const handleDateChange = (field, val) => {
    formik.setFieldValue(field, val ? format(val, 'yyyy-MM-dd') : '')
  }

  useEffect(() => {
    const selectedProduct = productDropdownData?.products?.find(
      p => p.product_id === formik.values.product_id
    )
    const unitPrice = selectedProduct?.base_price || 0
    if (unitPrice) {
      formik.setFieldValue('cost_price', unitPrice)
    } else {
      formik.setFieldValue('cost_price', '')
    }
  }, [formik.values.product_id, productDropdownData])

  return (
    <CustomeModal
      open={openStockEntry}
      onOpenChange={setOpenStockEntry}
      header='Add Stock Entry'
    >
      {productDropdownData?.products?.length === 0 && (
        <div className='col-span-2 flex gap-1 border justify-center items-center border-dashed rounded-lg p-2 bg-primary/5 '>
          <p className='text-sm text-gray-600'>
            No product found. Please add a product.
          </p>
          <Button size='addbutton' type='submit' onClick={() => setOpen(true)}>
            + Add Product
          </Button>
          <AddProductModal open={open} setOpen={setOpen} />
        </div>
      )}

      <form
        onSubmit={formik.handleSubmit}
        className='w-full max-w-2xl space-y-5 '
      >
        {/* Product Name */}
        <Input
          label='Supplier Name'
          placeholder='Enter Supplier Name'
          name='supplier_name'
          value={formik.values.supplier_name}
          onChange={formik.handleChange}
          error={formik.touched.supplier_name && formik.errors.supplier_name}
        />

        {/* Grid Fields */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input
            label='Invoice Name'
            placeholder='Add'
            name='invoice_number'
            value={formik.values.invoice_number}
            onChange={formik.handleChange}
            error={
              formik.touched.invoice_number && formik.errors.invoice_number
            }
          />

          <CustomDatePicker
            disableFuture={true}
            label='Invoice Date'
            placeholder='Add'
            name='invoice_date'
            value={formik.values.invoice_date}
            onChange={val => handleDateChange('invoice_date', val)}
            error={formik.touched.invoice_date && formik.errors.invoice_date}
          />

          <CustomeSelect
            label='product Name'
            placeholder='Add'
            name='product_id'
            options={productDropdownData?.products || []}
            value={formik.values.product_id}
            onChange={value => formik.setFieldValue('product_id', value)}
            error={formik.touched.product_id && formik.errors.product_id}
          />

          <Input
            label='Quantity'
            placeholder='Add'
            name='quantity'
            value={formik.values.quantity}
            onChange={formik.handleChange}
            error={formik.touched.quantity && formik.errors.quantity}
          />

          <Input
            disabled={true}
            label='Unit Cost'
            name='cost_price'
            value={formik.values.cost_price}
            placeholder='Auto-calculated'
          />
        </div>

        {/* Buttons */}
        <div className='flex justify-end gap-3 pt-4'>
          <Button size='addbutton' type='submit'>
            Add Stock
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default AddStockEntry
