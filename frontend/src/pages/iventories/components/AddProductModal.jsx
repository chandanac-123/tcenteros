import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import {
  useCreateProductMutation,
  useAllSKUsQuery,
  useInventoryProfitQuery
} from '@api-queries/inventory/Query'
import { useFormik } from 'formik'
import { productValidationSchema } from '@utils/validations'
import CustomeSelect from '@common/components/CustomeSelect'
import { useNavigate } from 'react-router-dom'
import { useSettingsTabStore } from '@store/tabStore'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import AddProductCategory from '@pages/settings/components/AddProductCategory'

const AddProductModal = ({ open, setOpen }) => {
  const { setSelectedTab } = useSettingsTabStore()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const { mutateAsync: createProduct, isLoading } = useCreateProductMutation()
  const { data: inventoryProfitData, isFetching: isFetchingInventoryProfit } =
    useInventoryProfitQuery()
  console.log('inventoryProfitData: ', inventoryProfitData?.inventory_profit)

  const { data: skus } = useAllSKUsQuery()
  const navigate = useNavigate()

  const isCategoryEmpty = !skus || skus.length === 0
  const initialValues = {
    name: '',
    category: '',
    unit_of_measure: '',
    base_price: '',
    selling_price: '',
    reorder_level: ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: productValidationSchema,
    onSubmit: async values => {
      try {
        await createProduct(values)
        setOpen(false)
        formik.resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const profitPercent = inventoryProfitData?.inventory_profit || 0

  const suggestedSellingPrice =
    formik.values.base_price && profitPercent
      ? Number(formik.values.base_price) * (1 + Number(profitPercent) / 100)
      : ''

  useEffect(() => {
    const base = Number(formik.values.base_price)
    const percent = Number(inventoryProfitData?.inventory_profit || 0)

    if (base) {
      const sellingPrice = base + (base * percent) / 100
      formik.setFieldValue('selling_price', sellingPrice)
    }
  }, [formik.values.base_price, inventoryProfitData])

  return (
    <CustomeModal open={open} onOpenChange={setOpen} header='Add Product'>
      <form
        onSubmit={formik.handleSubmit}
        className='w-full max-w-2xl space-y-5 '
      >
        {/* Grid Fields */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 '>
          <Input
            label='Product Name'
            placeholder='Enter Product Name'
            name='name'
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name}
          />

          <div className='flex items-center gap-2'>
            <div className='flex-1'>
              {isCategoryEmpty ? (
                <p className='flex text-red_text items-baseline '>Create a category first.</p>
              ) : (
                <CustomeSelect
                  label='Category'
                  placeholder='Select Category'
                  name='category'
                  options={skus || []}
                  value={formik.values.category}
                  onChange={value => formik.setFieldValue('category', value)}
                  error={formik.touched.category && formik.errors.category}
                />
              )}
            </div>
            <button
              type='button'
              className='h-9 w-9 flex items-center justify-center rounded-md border border-input mt-6'
              onClick={() => setCategoryOpen(true)}
            >
              <Plus className='h-4 w-4 text-primary' />
            </button>
            <AddProductCategory
              open={categoryOpen}
              onOpenChange={setCategoryOpen}
            />
          </div>

          <Input
            label='Unit Type'
            placeholder='e.g. Piece, Kg'
            name='unit_of_measure'
            value={formik.values.unit_of_measure}
            onChange={formik.handleChange}
            error={
              formik.touched.unit_of_measure && formik.errors.unit_of_measure
            }
          />

          <Input
            label='Base Price'
            placeholder='₹1500'
            name='base_price'
            value={formik.values.base_price}
            onChange={formik.handleChange}
            error={formik.touched.base_price && formik.errors.base_price}
          />

          <div>
            <Input
              label='Selling Price'
              placeholder='₹2000'
              name='selling_price'
              value={formik.values.selling_price}
              onChange={formik.handleChange}
              error={
                formik.touched.selling_price && formik.errors.selling_price
              }
            />

            {formik.values.base_price && (
              <p className='text-xs text-gray-500 mt-1'>
                Recommended price based on profit settings: ₹
                {suggestedSellingPrice}. You can change it if needed.
              </p>
            )}
          </div>

          <Input
            label='Reorder Level'
            placeholder='Enter Reorder Level'
            name='reorder_level'
            value={formik.values.reorder_level}
            onChange={formik.handleChange}
            error={formik.touched.reorder_level && formik.errors.reorder_level}
          />

          {/* <Input label='Expire Date' placeholder='Select Expire Date' /> */}
        </div>

        {/* Buttons */}
        <div className='flex justify-end gap-3 pt-4'>
          <Button size='addbutton' type='submit'>
            Add Product
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default AddProductModal
