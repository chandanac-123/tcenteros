import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import { Textarea } from '@pages/components/ui/textarea'
import { productCategorySchema } from '@utils/validations'
import { useFormik } from 'formik'
import { useCreateSKUMutation } from '@api-queries/center-admin/inventory/Query'

const AddProductCategory = ({ open, onOpenChange }) => {
  const { mutateAsync: create, isLoading } = useCreateSKUMutation()

 const initialValues = {
    name: '',
    description: ''
  }

  const formik = useFormik({
    initialValues,
    validationSchema: productCategorySchema,
    onSubmit: async values => {
      try {
        await create(values)
        onOpenChange(false)
        formik.resetForm()
      } catch (error) {
      }
    }
  })

  return (
    <CustomeModal
      open={open}
      onOpenChange={onOpenChange}
      header='Add Product Category'
    >
      <form onSubmit={formik.handleSubmit}>
        <div className='grid grid-cols-1 gap-3'>
          <Input
            label='Product Category Name'
            placeholder='Enter product category name...'
            name='name'
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name}
          />
          <Textarea
            label='Product Category Description'
            placeholder='Enter product category description...'
            name='description'
            value={formik.values.description}
            onChange={formik.handleChange}
          />
        </div>
        <div className='flex justify-end mt-4'>
          <Button
            size='addbutton'
            variant='default'
            type='submit'
          >
            Submit
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default AddProductCategory
