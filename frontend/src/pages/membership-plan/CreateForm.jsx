import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/components/CustomeSelect'
import { Textarea } from '@pages/components/ui/textarea'
import CustomeModal from '@common/components/CustomeModal'
import { useFormik } from 'formik'
import {
  useCreatePlanMutation,
  useUpdatePlanMutation,
  usePlanGetByIdQuery
} from '@api-queries/membership-plan/Query'
import { membershipValidationSchema } from '@utils/validations'
import { Checkbox } from '@pages/components/ui/checkbox'

const CreateMembershipForm = ({ open, setOpen, editId }) => {
  const { data: planData } = usePlanGetByIdQuery(editId, {
    enabled: !!editId
  })

  const { mutateAsync: createPlan, isLoading } = useCreatePlanMutation()
  const { mutateAsync: updatePlan, isLoading: isUpdating } =
    useUpdatePlanMutation()

  const initialValues = {
    membership_name: planData?.membership_name || '',
    duration_count: planData?.duration_count || '',
    duration_unit: planData?.duration_unit || 'month',
    default_price: planData?.default_price || '',
    description: planData?.description || '',
    network_enabled: planData?.network_enabled || false,
    membership_features:
      planData?.membership_features?.map(f => f.feature_name) || []
  }

  const formik = useFormik({
    initialValues,
    validationSchema: membershipValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const payload = {
          membership_name: values.membership_name,
          description: values.description,
          duration_count: parseInt(values.duration_count),
          duration_unit: values.duration_unit,
          default_price: parseFloat(values.default_price),
          membership_features: values.membership_features.filter(
            f => f.trim() !== ''
          ),
          network_enabled: values.network_enabled
        }
        if (editId) {
          await updatePlan({ id: editId, data: payload })
        } else {
          await createPlan(payload)
        }

        setOpen(false)
        formik.resetForm()
      } catch (error) {
        console.error('Error submitting form:', error)
      }
    }
  })

  const handleAddFeature = () => {
    formik.setFieldValue('membership_features', [
      ...formik.values.membership_features,
      ''
    ])
  }

  const handleFeatureChange = (index, value) => {
    const updated = [...formik.values.membership_features]
    updated[index] = value
    formik.setFieldValue('membership_features', updated)
  }
  console.log(formik.values, 'network_enabled')

  const handleRemoveFeature = index => {
    formik.setFieldValue(
      'membership_features',
      formik.values.membership_features.filter((_, i) => i !== index)
    )
  }

  const membershipDurationOptions = [
    { id: 'month', name: 'Months' },
    { id: 'year', name: 'Years' }
  ]

  return (
    <>
      <CustomeModal
        open={open}
        onOpenChange={setOpen}
        header={planData ? 'Update Membership Plan' : 'Create Membership Plan'}
      >
        <form className='space-y-4 w-full' onSubmit={formik.handleSubmit}>
          {/* Row 1: Membership Name & Duration */}
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Membership Name'
                name='membership_name'
                placeholder='Enter membership name'
                value={formik.values.membership_name}
                onChange={formik.handleChange}
                error={
                  formik.touched.membership_name &&
                  formik.errors.membership_name
                }
              />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <span className='text-sm font-normal text-textblack'>
                Set Membership Duration
              </span>
              <div className='flex gap-2'>
                <div className='flex-1'>
                  <Input
                    type='number'
                    label=''
                    name='duration_count'
                    placeholder='Enter value'
                    value={formik.values.duration_count}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.duration_count &&
                      formik.errors.duration_count
                    }
                  />
                </div>
                <div className='flex-1'>
                  <CustomeSelect
                    options={membershipDurationOptions}
                    value={formik.values.duration_unit}
                    onChange={option =>
                      formik.setFieldValue('duration_unit', option.id)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Price & Image */}
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Default Price'
                name='default_price'
                placeholder='Enter package price'
                type='number'
                step='0.01'
                value={formik.values.default_price}
                onChange={formik.handleChange}
                error={
                  formik.touched.default_price && formik.errors.default_price
                }
              />
            </div>

            <div className='flex-1 justify-end flex items-end'>
              <div className='border border-gray-300 rounded-md p-2 flex items-center gap-2 h-9'>
                <Checkbox
                  checked={!!formik.values.network_enabled}
                  onCheckedChange={val =>
                    formik.setFieldValue('network_enabled', !!val)
                  }
                />
                <span className='text-sm text-textblack'>Networking</span>
              </div>
            </div>
          </div>

          <div>
            <Textarea
              label='Description'
              name='description'
              placeholder='Enter membership description'
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </div>

          {/* Features Section */}
          <div className='flex flex-col gap-4'>
            <div>
              <span className='font-medium text-base text-textblack'>
                Membership Features
              </span>
              {formik.touched.membership_features &&
                formik.errors.membership_features &&
                typeof formik.errors.membership_features === 'string' && (
                  <p className='text-red-500 text-xs mt-1'>
                    {formik.errors.membership_features}
                  </p>
                )}
            </div>

            <div className='flex flex-col gap-3'>
              {formik.values.membership_features.map((feature, index) => (
                <div key={index} className='flex items-center gap-2 w-full'>
                  <Input
                    className='flex-1'
                    placeholder='Enter feature'
                    value={feature}
                    onChange={e => handleFeatureChange(index, e.target.value)}
                  />

                  <button
                    type='button'
                    onClick={() => handleRemoveFeature(index)}
                    className='text-red-500 hover:text-red-700 shrink-0 font-bold text-lg'
                  >
                    ✕
                  </button>
                </div>
              ))}

              <Button
                type='button'
                onClick={handleAddFeature}
                size='filterbutton'
                variant='button_outlined_textleft'
              >
                + Add Feature
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex gap-2 justify-end pt-4'>
            <Button
              size='addbutton'
              variant='default'
              type='submit'
              disabled={isLoading || isUpdating}
            >
              {isLoading || isUpdating
                ? planData
                  ? 'Updating...'
                  : 'Creating...'
                : planData
                ? 'Update Plan'
                : 'Create Plan'}
            </Button>
          </div>
        </form>
      </CustomeModal>
    </>
  )
}
export default CreateMembershipForm
