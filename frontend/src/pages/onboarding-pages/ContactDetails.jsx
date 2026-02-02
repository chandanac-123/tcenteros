import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import { Input } from '@pages/components/ui/input'
import { Checkbox } from '@pages/components/ui/checkbox'
import { Mail, User, Phone, MapPin, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { useState } from 'react'
import { useCreateOnboardCenterMutation } from '@api-queries/on-boarding/Query'
import { useOnboardingStore } from '@store/onboardingStore'
import { onboardingValidationSchema } from '@utils/validations'

const ContactDetails = () => {
  const navigate = useNavigate()
  const { mutateAsync: create, isPending } = useCreateOnboardCenterMutation()
  const store = useOnboardingStore()
  const setOnboardId = useOnboardingStore(state => state.setOnboardId)

  const enabledFeatureIds = Object.values(store?.centerTools || {})
    .filter(tool => tool?.enabled === true)
    .map(tool => tool.feature_id)

  // Map all relevant store values to initialValues
  const initialValues = {
    center_name: store.center_name || '',
    contact_person: store.contact_person || '',
    center_email: store.center_email || '',
    center_phone: store.center_phone || '',
    city: store.city || '',
    is_terms_and_conditions: Boolean(store.is_terms_and_conditions) || false,
    center_category_id:store?.typeSelectionId || '',
    kind_of_center: store.kind_of_center || 'Hybrid',
    members_count:
      store.memberCount === '500+'
        ? 525
        : store.memberCount?.split('-')[1]
        ? parseInt(store.memberCount.split('-')[1], 10)
        : 50,
    trainer_count:
      store.trainerCount === '10+'
        ? 21
        : store.trainerCount?.split('-')[1]
        ? parseInt(store.trainerCount.split('-')[1], 10)
        : 5,
    currently_using_digital_tool: store.digitalToolsSelected || [],
    marketing_platform: store.marketingSupportType
      ? [store.marketingSupportType]
      : [],
    platform_feature_ids: store.centerTools ? enabledFeatureIds : []
  }

  const [submitted, setSubmitted] = useState(false)
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: onboardingValidationSchema,
    onSubmit: async values => {
      try {
        const response = await create(values)
        if (response && response.id) {
          setOnboardId(response.id)
        }
        setSubmitted(true)
        formik.resetForm()
      } catch (error) {
        console.log('error: ', error)
      }
    }
  })

  return (
    <SecondaryLayout>
      <OnboardHeader />
      <div className='px-4 sm:px-10'>
        <div className='flex flex-col gap-1 mb-6 text-xl font-medium'>
          Let’s Set This Up for You
        </div>
        <div className='flex flex-row gap-16'>
          {/* Left Part */}
          <div className='w-full md:w-1/2'>
            <form
              id='contact-details-form'
              className='space-y-3'
              onSubmit={formik.handleSubmit}
            >
              <Input
                label='Center Name'
                name='center_name'
                placeholder='Center Name'
                icon={<Users className='w-5 h-5 text-primary mr-2' />}
                value={formik.values.center_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.center_name && formik.errors.center_name}
              />
              <Input
                label='Contact Person'
                name='contact_person'
                placeholder='Contact Person'
                icon={<User className='w-5 h-5 text-primary mr-2' />}
                value={formik.values.contact_person}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.contact_person && formik.errors.contact_person
                }
              />
              <Input
                label='Email*'
                name='center_email'
                placeholder='Email'
                type='email'
                icon={<Mail className='w-5 h-5 text-primary mr-2' />}
                value={formik.values.center_email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.center_email && formik.errors.center_email
                }
              />
              <Input
                label='Phone*'
                name='center_phone'
                placeholder='Phone'
                type='tel'
                icon={<Phone className='w-5 h-5 text-primary mr-2' />}
                value={formik.values.center_phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.center_phone && formik.errors.center_phone
                }
              />
              <Input
                label='City'
                name='city'
                placeholder='City'
                icon={<MapPin className='w-5 h-5 text-primary mr-2' />}
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && formik.errors.city}
              />
              <div className='flex flex-col'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='agree'
                    name='is_terms_and_conditions'
                    checked={formik.values.is_terms_and_conditions === true}
                    onCheckedChange={val =>
                      formik.setFieldValue('is_terms_and_conditions', val)
                    }
                    onBlur={formik.handleBlur}
                  />
                  <label htmlFor='agree' className='text-sm'>
                    I agree to be contacted for onboarding and support.
                  </label>
                </div>
                {formik.touched.is_terms_and_conditions && formik.errors.is_terms_and_conditions && (
                  <span className='text-xs text-red-500 mt-1'>
                    {formik.errors.is_terms_and_conditions}
                  </span>
                )}
              </div>
            </form>
          </div>
          {/* Right Part */}
          <div className='w-full md:w-1/2 gap-4 flex flex-col justify-center items-center text-center'>
            <span className='text-3xl font-semibold  text-secondary'>
              Almost there!
            </span>
            <span className='text-base'>
              To unlock your custom pricing and send a copy of this
              recommendation to your inbox, just let us know where to reach you.
            </span>
          </div>
        </div>
      </div>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button
          variant='outline_secondary'
          size='sm'
          leftIcon={backarrow}
          onClick={() => navigate('/marketing-support')}
        >
          Back
        </Button>
        {!submitted ? (
          <Button
            variant='outline_primary'
            rightIcon={rightcolorarrow}
            type='submit'
            form='contact-details-form'
          >
            Submit
          </Button>
        ) : (
          <Button
            variant='outline_primary'
            rightIcon={rightcolorarrow}
            onClick={() => navigate('/pricing-page')}
          >
            View My Pricing
          </Button>
        )}
      </div>
    </SecondaryLayout>
  )
}
export default ContactDetails
