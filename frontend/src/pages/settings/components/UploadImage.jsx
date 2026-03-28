import CustomeModal from '@common/components/CustomeModal'
import { galleryImageValidationSchema } from '@utils/validations'
import { useFormik } from 'formik'
import { useCreateGalleryMutation } from '@api-queries/gallery/Query'
import InputFile from '@common/components/CustomeFileUpload'
import { Button } from '@pages/components/ui/button'

const UploadImage = ({ open, setOpen, refetch }) => {
  const { mutateAsync: createGallery } = useCreateGalleryMutation()

  const initialValues = {
    image_url: null
  }

  const formik = useFormik({
    initialValues,
    validationSchema: galleryImageValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const formData = new FormData()
        formData.append('file', values.image_url)
        await createGallery(formData)
        refetch()
        setOpen(false)
        formik.resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <CustomeModal open={open} onOpenChange={setOpen} header='Upload Image'>
      <form onSubmit={formik.handleSubmit}>
        <InputFile
          name='image_url'
          value={formik.values.image_url}
          onChange={e => {
            formik.setFieldValue('image_url', e.target.value)
          }}
          onRemove={() => {
            formik.setFieldValue('image_url', null)
            formik.setFieldTouched('image_url', true, false)
          }}
          error={formik.touched.image_url && formik.errors.image_url}
        />

        <div className='flex justify-end mt-4'>
          <Button size='addbutton' variant='default' type='submit'>
            Add Image
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default UploadImage
