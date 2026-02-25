import ContentLayout from '@common/masterLayout/ContentLayout'
import InputFile from '@common/CustomeFileUpload'
import { Button } from '@pages/components/ui/button'
import { useFormik } from 'formik'
import { brandingValidationSchema } from '@utils/validations'
import { Input } from '@pages/components/ui/input'

const Branding = () => {
  const initialValues = {
    app_name: '',
    primary_color: '',
    secondary_color: '',
    app_logo: null
  }

  const formik = useFormik({
    initialValues,
    validationSchema: brandingValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <ContentLayout>
      <h1 className='text-2xl font-bold mb-4'>Branding</h1>
      <form onSubmit={formik.handleSubmit} className='space-y-4'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Name of the App'
              name='app_name'
              placeholder='Enter the Name of the App'
              value={formik.values.app_name}
              onChange={formik.handleChange}
              error={formik.touched.app_name && formik.errors.app_name}
            />
          </div>
          <div className='flex-1'>
            <InputFile
              label='Upload Image'
              name='app_logo'
              value={formik.values.app_logo}
              onChange={formik.handleChange}
              onRemove={() => {
                formik.setFieldValue('app_logo', null)
                formik.setFieldTouched('app_logo', true, false)
              }}
              error={formik.touched.app_logo && formik.errors.app_logo}
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Primary Color Picker'
              name='primary_color'
              placeholder='Enter the Primary Color'
              value={formik.values.primary_color}
              onChange={formik.handleChange}
              error={
                formik.touched.primary_color && formik.errors.primary_color
              }
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Secondary Color Picker'
              name='secondary_color'
              placeholder='Enter the Secondary Color'
              value={formik.values.secondary_color}
              onChange={formik.handleChange}
              error={
                formik.touched.secondary_color && formik.errors.secondary_color
              }
            />
          </div>
        </div>

        <div className='flex justify-center mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            Create Branding
          </Button>
        </div>
      </form>
    </ContentLayout>
  )
}
export default Branding
