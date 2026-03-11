import React from 'react'
import CustomeModal from '@common/components/CustomeModal'
import CustomeSelect from '@common/components/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import {
  useCreateSalaryMutation,
  useSalaryGetByIdQuery,
  useUpdateSalaryMutation
} from '@api-queries/employee-salary/Query'
import { useFormik } from 'formik'
import { salaryValidationSchema } from '@utils/validations'
import { Input } from '@pages/components/ui/input'
import { useEmployeesDropdownQuery } from '@api-queries/employee-management/Query'

const payCycleOptions = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' }
]
const salaryTypeOptions = [
  { id: 'permanent', label: 'Permanent' },
  { id: 'contract', label: 'Contract' },
  { id: 'part_time', label: 'Part-Time' }
]

const StructureAddEdit = ({ open, setOpen, id }) => {
  const { data: salaryData, isFetching: isEmployeeFetching } =
    useSalaryGetByIdQuery(id)
  const { data: employeesDropdown } = useEmployeesDropdownQuery()

  const { mutateAsync: createEmployeeSalary, isPending } =
    useCreateSalaryMutation()
  const { mutateAsync: updateEmployeeSalary, isPending: updatePending } =
    useUpdateSalaryMutation()

  const initialValues = {
    employee_id: salaryData?.employee_id || '',
    salary: salaryData?.salary || '',
    salary_type: salaryData?.salary_type || null,
    pay_cycle: salaryData?.pay_cycle || null
  }

  const formik = useFormik({
    initialValues,
    validationSchema: salaryValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (id) {
          await updateEmployeeSalary({ id, data: values })
        } else {
          await createEmployeeSalary(values)
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
      header={id ? 'Edit Salary Structure' : 'Create Salary Structure'}
      className='max-w-xl w-full'
    >
      <form className='space-y-4' onSubmit={formik.handleSubmit}>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomeSelect
              label='Employee Name'
              name='employee_id'
              disabled={id ? true : false}
              options={employeesDropdown}
              value={formik.values.employee_id}
              onChange={value => formik.setFieldValue('employee_id', value)}
              error={formik.touched.employee_id && formik.errors.employee_id}
              placeholder='Select Employee'
            />
          </div>
          <div className='flex-1'>
            <CustomeSelect
              label='Salary Type'
              name='salary_type'
              placeholder='Select Salary Type'
              options={salaryTypeOptions}
              value={formik.values.salary_type}
              onChange={value => formik.setFieldValue('salary_type', value)}
              error={formik.touched.salary_type && formik.errors.salary_type}
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomeSelect
              label='Pay Cycle'
              name='pay_cycle'
              placeholder='Select Pay Cycle'
              options={payCycleOptions}
              value={formik.values.pay_cycle}
              onChange={value => formik.setFieldValue('pay_cycle', value)}
              error={formik.touched.pay_cycle && formik.errors.pay_cycle}
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Basic Salary'
              name='salary'
              value={formik.values.salary}
              onChange={formik.handleChange}
              error={formik.touched.salary && formik.errors.salary}
            />
          </div>
        </div>
        <div className='flex justify-end'>
          <Button size='addbutton' type='submit'>
            {id ? 'Update Salary Structure' : 'Add Salary Structure'}
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default StructureAddEdit
