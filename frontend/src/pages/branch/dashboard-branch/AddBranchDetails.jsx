import React from 'react'
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/components/CustomeSelect'
import InputFile from '@common/components/CustomeFileUpload'
import PasswordInput from '@common/components/PasswordInput'
import {
  useGetPurchasedBranchesQuery,
  useGetBranchCategoriesListQuery,
  useCreateNewBranchMutation
} from '@api-queries/center-admin/branch/Query'
import { useFormik } from 'formik'
import { branchValidationSchema } from '@utils/validations'
import CitySelect from '@common/components/CitySelect'
import StateSelect from '@common/components/StateSelect'
import CountrySelect from '@common/components/CountrySelect'

const AddBranchDetails = ({ open, onOpenChange }) => {
  const { data: purchasedData, isPending } = useGetPurchasedBranchesQuery()
  const { data: categoryList, isLoading } = useGetBranchCategoriesListQuery()
  const { mutate: createNewBranch } = useCreateNewBranchMutation()

  const param = purchasedData?.payment_order_id

  const initialValues = {
    name: '',
    center_category_id: '',
    address_line_1: '',
    address_line_2: '',
    center_email: '',
    password: '',
    center_phone: '',
    center_image: null,
    country: '',
    state: '',
    city: '',
    postal_code: ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: branchValidationSchema,
    onSubmit: async values => {
      try {
        const formData = new FormData()
        Object.keys(values).forEach(key => {
          if (values[key] !== null && values[key] !== '') {
            formData.append(key, values[key])
          }
        })
        createNewBranch({
          param,
          data: formData
        })
        formik.resetForm()
        onOpenChange(false)
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <CustomeModal open={open} onOpenChange={onOpenChange} className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className='flex flex-col w-full'>
        <h2 className='text-xl font-semibold pb-4'>Create Branch</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className='grid grid-col-1 sm:grid-cols-3 gap-4 p-3  space-y-1'>
            <Input
              label='Branch Name'
              name='name'
              placeholder='Enter Your Branch Name'
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && formik.errors.name}
            />
            <CustomeSelect
              label='Center Category'
              name='center_category_id'
              placeholder='Select Category'
              options={categoryList}
              value={formik.values.center_category_id}
              onChange={value =>
                formik.setFieldValue('center_category_id', value)
              }
              error={
                formik.touched.center_category_id &&
                formik.errors.center_category_id
              }
            />
            <Input
              label='Address Line 1'
              name='address_line_1'
              placeholder='Address Line 1'
              value={formik.values.address_line_1}
              onChange={formik.handleChange}
              error={
                formik.touched.address_line_1 && formik.errors.address_line_1
              }
            />
            <Input
              label='Address Line 2'
              name='address_line_2'
              placeholder='Address Line 2'
              value={formik.values.address_line_2}
              onChange={formik.handleChange}
              error={formik.touched.address_line_2 && formik.errors.address_line_2}
            />
            <Input
              label='Branch Email'
              name='center_email'
              placeholder='Enter Your Email ID'
              value={formik.values.center_email}
              onChange={formik.handleChange}
              error={formik.touched.center_email && formik.errors.center_email}
            />
            <PasswordInput
              label='Create Password'
              name='password'
              placeholder='Create Password'
              iconPosition='end'
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && formik.errors.password}
            />

            <Input
              label='*Phone number'
              name='center_phone'
              placeholder='*Phone number'
              value={formik.values.center_phone}
              onChange={formik.handleChange}
              error={formik.touched.center_phone && formik.errors.center_phone}
            />

            <div className=''>
              <InputFile
                label='Profile Pic'
                name='center_image'
                placeholder='Upload Image'
                value={formik.values.center_image}
                onChange={formik.handleChange}
                onRemove={() => {
                  formik.setFieldValue('center_image', null)
                  formik.setFieldTouched('center_image', true, false)
                }}
                error={
                  formik.touched.center_image && formik.errors.center_image
                }
              />
            </div>
          </div>

          <div className='grid grid-col-1 sm:grid-cols-4 gap-4 p-3  space-y-1'>
            <CitySelect
              country={formik.values.countryCode}
              value={formik.values.city}
              onChange={data => {
                formik.setFieldValue('city', data.city)
                formik.setFieldValue('state', data.state) // auto-fill
                formik.setFieldValue('country', data.country) // auto-fill country
              }}
              label='City'
              error={formik.touched.city && formik.errors.city}
            />

            <StateSelect
              country={formik.values.countryCode}
              value={formik.values.state}
              onChange={val => formik.setFieldValue('state', val)}
              label='State'
            />

            <CountrySelect
              value={formik.values.country}
              onChange={val => {
                formik.setFieldValue('country', val.country)
              }}
              label='Country'
            />
            <Input
              label='Pincode'
              name='postal_code'
              placeholder='Pincode'
              value={formik.values.postal_code}
              onChange={formik.handleChange}
              error={formik.touched.postal_code && formik.errors.postal_code}
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 space-y-1 pt-5'>
            <div className=''></div>
            <div className=''>
              <Button
                variant='button_filled'
                size='sm'
                className='w-full'
                type='submit'
              >
                Create Branch
              </Button>
            </div>
            <div className=''></div>
          </div>
        </form>
      </div>
    </CustomeModal>
  )
}

export default AddBranchDetails
