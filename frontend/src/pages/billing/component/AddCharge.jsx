import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/components/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import { useFormik } from 'formik'
import { addChargeSchema } from '@utils/validations'
import { useAddChargeMutation } from '@api-queries/center-admin/billing/Query'

const paymentTypes = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'other', label: 'Others' }
]
const transactionTypes = [
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expense' }
]
const otherTypesExpense = [
  { id: 'Rent Expense', label: 'Rent Expense' },
  { id: 'Marketing Expense', label: 'Marketing Expense' },
  { id: 'Utilities Expense', label: 'Utilities Expense' },
  { id: 'General Expense', label: 'General Expense' },
  { id: 'Maintenance Expense', label: 'Maintenance Expense' },
  { id: 'Travel Expense', label: 'Travel Expense' },
  { id: 'Water Bill Expense', label: 'Water Bill Expense' },
  { id: 'Electricity Bill Expense', label: 'Electricity Bill Expense' }
]
const otherTypesIncome = [
  { id: 'Other Income', label: 'Other Income' },
]

const AddCharge = ({ openAddCharge, setOpenAddCharge }) => {
  const { mutateAsync: add_charge, isPending } = useAddChargeMutation()

  const initialValues = {
    transaction_type: '',
    payment_method: '',
    category: '',
    amount: null,
    title: ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: addChargeSchema,
    onSubmit: async values => {
      try {
        await add_charge(values)
        setOpenAddCharge(false)
        formik.resetForm()
      } catch (error) {
      }
    }
  })

  return (
    <CustomeModal
      header='Add Charge'
      open={openAddCharge}
      onOpenChange={setOpenAddCharge}
    >
      <form
        className='flex flex-col gap-2 lg:w-96 w-full'
        onSubmit={formik.handleSubmit}
      >
         <Input
          label='Title'
          placeholder='Enter Title'
          name='title'
          value={formik.values.title}
          onChange={formik.handleChange}
          error={formik.touched.title && formik.errors.title}
        />
        <CustomeSelect
          label='Transaction Type'
          name='transaction_type'
          placeholder='Select Transaction Type'
          value={formik.values.transaction_type}
          onChange={value => formik.setFieldValue('transaction_type', value)}
          options={transactionTypes}
          error={
            formik.touched.transaction_type && formik.errors.transaction_type
          }
        />
         <CustomeSelect
          label='Category'
          name='category'
          placeholder='Select Category'
          value={formik.values.category}
          onChange={value => formik.setFieldValue('category', value)}
          options={formik.values.transaction_type === 'income' ? otherTypesIncome : otherTypesExpense}
          error={
            formik.touched.category && formik.errors.category
          }
        />
        <Input
          label='Amount'
          placeholder='Enter amount'
          name='amount'
          type= 'number'
          value={formik.values.amount}
          onChange={formik.handleChange}
          error={formik.touched.amount && formik.errors.amount}
        />
        <CustomeSelect
          label='Payment Type'
          name='payment_method'
          placeholder='Select Payment Type'
          value={formik.values.payment_method}
          onChange={value => formik.setFieldValue('payment_method', value)}
          options={paymentTypes}
          error={formik.touched.payment_method && formik.errors.payment_method}
        />
       
        <div className='flex justify-end mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            Add Charge
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}
export default AddCharge
