import ContentLayout from '@common/masterLayout/ContentLayout'
import InputFile from '@common/CustomeFileUpload'
import { Button } from '@pages/components/ui/button'
import { useFormik } from 'formik'
import { brandingValidationSchema } from '@utils/validations'
import { Input } from '@pages/components/ui/input'
import CustomHexColorPicker from '@common/CustomeHexColorPicker'

const Branding = () => {
  const initialValues = {
    app_name: '',
    primary_color: '#1452D4',
    secondary_color: '#8B24E2',
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
    console.log('formik: ', formik.values);

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
            <CustomHexColorPicker
              label='Primary Color'
              value={formik.values.primary_color}
              name='primary_color'
              onChange={val => formik.setFieldValue('primary_color', val)}
            />
          </div>
          <div className='flex-1'>
            <CustomHexColorPicker
              label='Secondary Color Picker'
              value={formik.values.secondary_color}
              onChange={val => formik.setFieldValue('secondary_color', val)}
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
