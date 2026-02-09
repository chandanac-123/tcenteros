import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import InputFile from '@common/CustomeFileUpload'
import CustomeModal from '@common/CustomeModal'
import { useCreateCategoryMutation } from '@api-queries/employee-management/Query'
import React from 'react'
import { useFormik } from 'formik'
import { categoryValidationSchema } from '@utils/validations'

const AddCategory = ({ categoryOpen, setCategoryOpen }) => {
  const { mutateAsync: createCategory, isPending } = useCreateCategoryMutation()

  const initialValues = { name: '', image: null }

  const formik = useFormik({
    initialValues,
    validationSchema: categoryValidationSchema, // Uncomment if you have a schema
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData()
      formData.append('name', values.name)
      if (values.image) formData.append('image', values.image)
      try {
        await createCategory(formData)
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
      header='Create New Designation'
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
          onBlur={formik.handleBlur}
          error={formik.touched.name && formik.errors.name}
        />

       <InputFile
  label="Upload Image"
  name="image"
  onChange={e => {
    formik.setFieldValue('image', e.target.value) // value is already File
    formik.setFieldTouched('image', true)
  }}
  onRemove={() => {
    formik.setFieldValue('image', null)
    formik.setFieldTouched('image', true)
  }}
  error={formik.touched.image && formik.errors.image}
/>


        <div className='flex justify-end'>
          <Button size='addbutton' type='submit' disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Designation'}
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default AddCategory
