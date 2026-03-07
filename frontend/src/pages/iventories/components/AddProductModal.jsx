import CustomeModal from '@common/CustomeModal'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import {
  useCreateProductMutation,
  useAllSKUsQuery,
  useInventoryProfitQuery
} from '@api-queries/inventory/Query'
import { useFormik } from 'formik'
import { productValidationSchema } from '@utils/validations'
import CustomeSelect from '@common/CustomeSelect'
import { useNavigate } from 'react-router-dom'
import { useSettingsTabStore } from '@store/tabStore'
import { useEffect } from 'react'

const AddProductModal = ({ open, setOpen }) => {
  const { setSelectedTab } = useSettingsTabStore()
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

  const profitMultiplier = inventoryProfitData?.inventory_profit || 1

  const suggestedSellingPrice =
    formik.values.base_price && profitMultiplier
      ? Number(formik.values.base_price) * Number(profitMultiplier)
      : ''

  useEffect(() => {
    if (formik.values.base_price && profitMultiplier) {
      const suggested =
        Number(formik.values.base_price) * Number(profitMultiplier)

      formik.setFieldValue('selling_price', suggested)
    }
  }, [formik.values.base_price, profitMultiplier])


  return (
    <CustomeModal open={open} onOpenChange={setOpen} header='Add Product'>
      <form
        onSubmit={formik.handleSubmit}
        className='w-full max-w-2xl space-y-5 '
      >
        {/* Grid Fields */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input
            label='Product Name'
            placeholder='Enter Product Name'
            name='name'
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name}
          />

          {isCategoryEmpty ? (
            <div className='col-span-2 border border-dashed rounded-lg p-4 bg-gray-50'>
              <p className='text-sm text-gray-600'>
                No product categories found. Please add a category from the
                Settings before creating a product.
              </p>

              <Button
                type='button'
                size='addbutton'
                onClick={() => {
                  setSelectedTab(6)
                  navigate('/settings')
                }}
              >
                Go to Settings
              </Button>
            </div>
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
