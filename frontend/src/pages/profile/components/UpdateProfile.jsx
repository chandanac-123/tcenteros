import CustomeModal from '@common/CustomeModal'
import { Button } from '@pages/components/ui/button'
import InputFile from '@common/CustomeFileUpload'
import { useFormik } from 'formik'

const UpdateProfile = ({ open, setOpen }) => {
  const initialValues = {
    image_url: null
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async () => {
      try {
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='Update Profile Photo'
    >
      <form onSubmit={formik.handleSubmit}>
        <div className='flex flex-col justify-center items-center gap-4'>
          <span className='text-grey text-sm font-normal'>
            Prathibha, help others recognize you!
          </span>
          <InputFile
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
          />
          <span className='text-grey text-sm '>
            Upload a clear photo for easy identification.
          </span>
        </div>

        <div className='flex gap-2 justify-end pt-4'>
          <Button  onClick={() => setOpen(false)} size='addbutton' variant='outline_secondary' type='button'>
            Cancel
          </Button>
          <Button size='addbutton' variant='default' type='submit'>
            Upload Photo
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}
export default UpdateProfile
