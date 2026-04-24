import edit from '@assets/form-icons/edit.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { useCreateCategoryMutation } from '@api-queries/center-admin/employee-management/Query'
import {
  useCategoriesQuery,
  useDeleteCategoryMutation
} from '@api-queries/center-admin/employee-management/Query'
import { useState } from 'react'
import AddCategory from '@pages/employee-management/category/AddCategory'
import DeleteModal from '@common/components/CustomeDelete'
import { Button } from '@pages/components/ui/button'
import InputFile from '@common/components/CustomeFileUpload'
import { useFormik } from 'formik'
import { categoryValidationSchema } from '@utils/validations'
import { Input } from '@pages/components/ui/input'

const CenterDesignations = () => {
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [value, setValue] = useState('')
  const [delValue, setDelValue] = useState('')
  const { data, isFetching } = useCategoriesQuery()
  const { mutateAsync: createCategory, isPending } = useCreateCategoryMutation()
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteCategoryMutation()

  const initialValues = {
    name: data?.name || '',
    image_url: data?.image_url || null
  }

  const handleDelete = () => {
    if (delValue) {
      deleteCategory(delValue)
      setDeleteOpen(false)
      setValue('')
    }
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
        await createCategory(formData)

        resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <div>
      <div className='text-lg font-semibold mb-6'>Add Designation</div>
      <form className='space-y-4 w-full py-4' onSubmit={formik.handleSubmit}>
        <Input
          className='w-full'
          label='Name the Designation'
          placeholder='Enter your employee Designation'
          name='name'
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && formik.errors.name}
        />
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
          <Button size='addbutton' type='submit' disabled={isPending}>
            Add Designation
          </Button>
        </div>
      </form>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {data?.map(d => (
          <div
            key={d.id}
            className='rounded-xl border justify-center border-gray-300 gap-3 bg-white shadow-sm flex items-center p-2 min-w-[200px] max-w-xs mx-auto'
          >
            <img
              src={d.image_url}
              alt={d.name}
              className='w-16 h-16 object-cover rounded-xl mb-2'
            />
            <div className='flex flex-col gap-2 justify-center items-center w-full'>
              <div className='font-normal text-sm text-pricing_text text-center w-full'>
                {d.name}
              </div>
              <div className='flex gap-3 w-full justify-center'>
                <button
                  type='button'
                  onClick={() => {
                    setValue(d.id)
                    setCategoryOpen(!categoryOpen)
                  }}
                  className='bg-[#F3E8FF] text-primary rounded-md hover:bg-primary/10 transition'
                >
                  <img src={edit} alt='edit' loading="lazy"/>
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setDelValue(d.id)
                    setDeleteOpen(true)
                  }}
                  className='bg-[#FFE4E6] text-red_text  rounded-md hover:bg-red-100 transition'
                >
                  <img src={deleteicon} alt='delete' loading="lazy"/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AddCategory
        categoryOpen={categoryOpen}
        setCategoryOpen={setCategoryOpen}
        id={value}
      />
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header='Are you sure you want to delete this Designation?'
        description='This designation will be removed from your active Categories and you wont be able designate the employee. This action cannot be undone.'
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default CenterDesignations
