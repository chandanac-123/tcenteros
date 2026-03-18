import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import InputFile from '@common/components/CustomeFileUpload'
import { useFormik } from 'formik'
import {
  useUpdateProfileImageMutation,
  useGetProfileByIdQuery,
  useUpdateProfilePicMutation
} from '@api-queries/center-profile/Query'
import { imageValidation } from '@utils/validations'
import * as Yup from 'yup'

const UpdateProfile = ({
  open,
  setOpen,
  center_edit,
  profileId,
  profileImage
}) => {
  const { mutateAsync: updateCenterImage } = useUpdateProfileImageMutation()
  const { mutateAsync: updateProfilePic } = useUpdateProfilePicMutation()
  const { data, isFetching } = useGetProfileByIdQuery(profileId)
  const initialValues = center_edit
    ? {
        image: data?.center_image_url || null,
        center_id: profileId || ''
      }
    : {
        profile_photo: profileImage || null
      }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object().shape(
      center_edit
        ? { image: imageValidation }
        : { profile_photo: imageValidation }
    ),
    onSubmit: async values => {
      const formData = new FormData()
      Object.keys(values).forEach(key => {
        if (values[key]) {
          formData.append(key, values[key])
        }
      })
      try {
        if (center_edit) {
          await updateCenterImage(formData)
        } else {
          await updateProfilePic(formData)
        }
        formik.resetForm()
        setOpen(false)
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header={center_edit ? 'Update Center Photo' : 'Update Profile Photo'}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className='flex flex-col justify-center items-center gap-4'>
          <span className='text-grey text-sm font-normal'>
            {center_edit ? '' : 'Prathibha, help others recognize you!'}
          </span>
          {center_edit ? (
            <InputFile
              name='image'
              value={formik.values.image}
              onChange={e => {
                formik.setFieldValue('image', e.target.value)
                formik.setFieldTouched('image', true, false)
              }}
              onRemove={() => {
                formik.setFieldValue('image', null)
                formik.setFieldTouched('image', true, false)
              }}
              error={formik.touched.image && formik.errors.image}
            />
          ) : (
            <InputFile
              name='profile_photo'
              value={formik.values.profile_photo}
              onChange={e => {
                formik.setFieldValue('profile_photo', e.target.value)
                formik.setFieldTouched('profile_photo', true, false)
              }}
              onRemove={() => {
                formik.setFieldValue('profile_photo', null)
                formik.setFieldTouched('profile_photo', true, false)
              }}
              error={
                formik.touched.profile_photo && formik.errors.profile_photo
              }
            />
          )}
          <span className='text-grey text-sm '>
            {center_edit ? '' : 'Upload a clear photo for easy identification.'}
          </span>
        </div>

        <div className='flex gap-2 justify-end pt-4'>
          <Button
            onClick={() => setOpen(false)}
            size='addbutton'
            variant='outline_secondary'
          >
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
