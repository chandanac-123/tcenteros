import React from 'react'
import CustomeModal from '@common/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import { useFormik } from 'formik'
import CustomDatePicker from '@common/CustomeDatepicker'
import { purchaseValidationSchema } from '@utils/validations'
import {
  useCreateStockEntryMutation,
  useProductDropdownQuery
} from '@api-queries/inventory/Query'
import { format } from 'date-fns'
import CustomeSelect from '@common/CustomeSelect'

const AddStockEntry = ({ openStockEntry, setOpenStockEntry }) => {
  const { mutateAsync: createStockEntry } = useCreateStockEntryMutation()
  const { data: productDropdownData } = useProductDropdownQuery()
  console.log('productDropdownData: ', productDropdownData);

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
          cost_price: parseInt(values.cost_price, 10)
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

  return (
    <CustomeModal
      open={openStockEntry}
      onOpenChange={setOpenStockEntry}
      header='Add Stock Entry'
    >
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
            label='Total Cost'
            placeholder='Add'
            name='cost_price'
            value={formik.values.cost_price}
            onChange={formik.handleChange}
            error={formik.touched.cost_price && formik.errors.cost_price}
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
