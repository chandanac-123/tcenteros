import ContentLayout from '@common/masterLayout/ContentLayout'
import InputFile from '@common/components/CustomeFileUpload'
import { Button } from '@pages/components/ui/button'
import { useFormik } from 'formik'
import { brandingValidationSchema } from '@utils/validations'
import CustomHexColorPicker from '@common/components/CustomeHexColorPicker'
import { useState } from 'react'
import DocumentCard from './components/DocumentCard'
import DocumentModal from './components/DocumentModal'
import {
  useAllBrandQuery,
  useCreateBrandMutation,
  useAllTermsandPrivacyQuery,
  useCreateTermsandPrivacyMutation,
  getUpdatedTermsandPrivacyQuery
} from '@api-queries/branding/Query'
import { useBrandingStore } from '@store/brandingStore'
import { Input } from '@pages/components/ui/input'

const Branding = () => {
  const { setBranding } = useBrandingStore()

  const { data: brandingData, isFetching } = useAllBrandQuery()
  const { mutateAsync: createBranding, isLoading: isCreating } =
    useCreateBrandMutation()
  const { data: termsandprivacyData, isFetching: isFetchingTermsandPrivacy } =
    useAllTermsandPrivacyQuery()
  const {
    mutateAsync: createTermsandPrivacy,
    isLoading: isCreatingTermsandPrivacy
  } = useCreateTermsandPrivacyMutation()
  const {
    data: updatedTermsandPrivacyData,
    isFetching: isFetchingUpdatedTermsandPrivacy
  } = getUpdatedTermsandPrivacyQuery()

  const [modalState, setModalState] = useState({
    open: false,
    type: null,
    mode: 'view'
  })

  // Show termsandprivacyData initially, then always show updatedTermsandPrivacyData after first edit
  const getDocumentContent = type => {
    if (updatedTermsandPrivacyData?.content) {
      return updatedTermsandPrivacyData.content
    }
    if (termsandprivacyData?.content) {
      return termsandprivacyData.content
    }
    return ''
  }

  const getDocumentTitle = () => {
    if (updatedTermsandPrivacyData?.title) {
      return updatedTermsandPrivacyData.title
    }
    if (termsandprivacyData?.title) {
      return termsandprivacyData.title
    }
    return ''
  }

  const initialValues = {
    primary_color:
      brandingData?.centers?.[0]?.branding?.primary_color || '#1452D4',
    secondary_color:
      brandingData?.centers?.[0]?.branding?.secondary_color || '#8B24E2',
    app_logo: brandingData?.centers?.[0]?.branding?.logo_url || null,
    app_name: brandingData?.centers?.[0]?.branding?.app_name || null
  }

  const formik = useFormik({
    initialValues,
    validationSchema: brandingValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const formData = new FormData()
        formData.append('primary_color', values.primary_color)
        formData.append('secondary_color', values.secondary_color)
        formData.append('app_name', values.app_name)
        if (values.app_logo instanceof File) {
          formData.append('logo', values.app_logo)
        }
        const response = await createBranding(formData)
        const updatedBranding = {
          logo_url: response?.logo_url,
          primary_color: response?.primary_color,
          secondary_color: response?.secondary_color,
          app_name: response?.app_name
        }
        setBranding(updatedBranding) // THIS updates instantly
      } catch (error) {
        console.error(error)
      }
    }
  })

  const handleSaveDocument = async (updatedTitle, updatedContent) => {
    try {
      const payload = {
        // type: modalState.type, // terms or privacy
        title: updatedTitle, // Use updated title
        content: updatedContent
      }
      await createTermsandPrivacy(payload)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ContentLayout>
      <h1 className='text-2xl font-bold mb-4'>Branding</h1>
      <form onSubmit={formik.handleSubmit} className='space-y-4'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='App Name'
              name='app_name'
              value={formik.values.app_name}
              onChange={formik.handleChange}
              error={formik.touched.app_name && formik.errors.app_name}
            />
          </div>
          <div className='flex-1'>
            <InputFile
              label='Upload App Logo'
              name='app_logo'
              value={formik.values.app_logo}
              onChange={e => {
                formik.setFieldValue('app_logo', e.target.value)
                formik.setFieldTouched('app_logo', true, false)
              }}
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
              label='Secondary Color'
              name='secondary_color'
              value={formik.values.secondary_color}
              onChange={val => formik.setFieldValue('secondary_color', val)}
            />
          </div>
        </div>

        <div className='flex justify-end mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            Create Branding
          </Button>
        </div>
      </form>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-8'>
        <DocumentCard
          title='Terms and Privacy'
          onView={() =>
            setModalState({ open: true, type: 'terms', mode: 'view' })
          }
          onEdit={() =>
            setModalState({ open: true, type: 'terms', mode: 'edit' })
          }
        />

        {/* <DocumentCard
          title='Privacy Policy'
          onView={() =>
            setModalState({ open: true, type: 'privacy', mode: 'view' })
          }
          onEdit={() =>
            setModalState({ open: true, type: 'privacy', mode: 'edit' })
          }
        /> */}
      </div>

      <DocumentModal
        open={modalState.open}
        mode={modalState.mode}
        title={getDocumentTitle()}
        initialContent={getDocumentContent(modalState.type)}
        onClose={() => setModalState({ open: false, type: null, mode: 'view' })}
        onSave={handleSaveDocument}
      />
    </ContentLayout>
  )
}
export default Branding
