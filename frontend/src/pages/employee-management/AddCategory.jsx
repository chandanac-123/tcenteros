import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import InputFile from '@common/CustomeFileUpload'
import CustomeModal from '@common/CustomeModal'
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useCategoriesGetByIdQuery
} from '@api-queries/employee-management/Query'
import React from 'react'
import { useFormik } from 'formik'
import { categoryValidationSchema } from '@utils/validations'

const AddCategory = ({ id, categoryOpen, setCategoryOpen }) => {
  const { data, isFetching } = useCategoriesGetByIdQuery(id)
  const { mutateAsync: createCategory, isPending } = useCreateCategoryMutation()
  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useUpdateCategoryMutation()

  const initialValues = {
    name: data?.name || '',
    image_url: data?.image_url || null
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: categoryValidationSchema, // Uncomment if you have a schema
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData()
      formData.append('name', values.name)
      if (values.image_url) formData.append('image', values.image_url)
      try {
        if (id) {
          await updateCategory({ id, data: formData })
        } else {
          await createCategory(formData)
        }
        setCategoryOpen(false)
        resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <CustomeModal
      open={categoryOpen}
      onOpenChange={setCategoryOpen}
      header={id ? 'Edit Designation' : 'Create New Designation'}
    >
      <form
        className='space-y-4 w-96 max-w-md sm:max-w-lg md:max-w-xl px-2 sm:px-4'
        onSubmit={formik.handleSubmit}
      >
        <Input
          className='w-full'
          label='Name the Designation'
          placeholder='Enter your employee Designation'
          name='name'
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && formik.errors.name}
        />

        {/* <InputFile
          label='Upload Image'
          name='image_url'
          onChange={e => {
            formik.setFieldValue('image_url', e.target.value) // value is File
            formik.setFieldTouched('image_url', true, false)
            formik.validateField('image_url') // <-- Add this line
          }}
          onRemove={() => {
            formik.setFieldValue('image_url', null)
            formik.setFieldTouched('image_url', true, false)
            formik.validateField('image_url') // <-- Add this line
          }}
          error={formik.touched.image_url && formik.errors.image_url}
        /> */}
        <InputFile
          label='Upload Image'
          name='image_url'
          value={formik.values.image_url}
          onChange={e => {
            formik.setFieldValue('image_url', e.target.value)
            formik.setFieldTouched('image_url', true, false)
          }}
          onRemove={() => {
            formik.setFieldValue('image_url', null)
            formik.setFieldTouched('image_url', true, false)
          }}
          error={formik.touched.image_url && formik.errors.image_url}
        />

        <div className='flex justify-end'>
          <Button
            size='addbutton'
            type='submit'
            disabled={isPending || isUpdating}
          >
            {id ? 'Update Designation' : 'Add Designation'}
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default AddCategory
