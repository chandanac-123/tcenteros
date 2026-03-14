import CustomeModal from '@common/components/CustomeModal'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/components/CustomeSelect'
import { Button } from '@pages/components/ui/button'
import { Textarea } from '@pages/components/ui/textarea'
import { useFormik } from 'formik'
import { addChargeSchema } from '@utils/validations'
import { useAddChargeMutation } from '@api-queries/billing/Query'

const paymentTypes = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'other', label: 'Others' }
]
const transactionTypes = [
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expense' }
]

const AddCharge = ({ openAddCharge, setOpenAddCharge }) => {
  const { mutateAsync: add_charge, isPending } = useAddChargeMutation()

  const initialValues = {
    transaction_type: '',
    payment_method: '',
    category: '',
    amount: '',
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
        console.error(error)
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
        <Input
          label='Category'
          placeholder='Enter category'
          name='category'
          value={formik.values.category}
          onChange={formik.handleChange}
          error={formik.touched.category && formik.errors.category}
        />
        <Input
          label='Amount'
          placeholder='Enter amount'
          name='amount'
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
        <Textarea
          label='Description'
          placeholder='Enter Description'
          name='title'
          value={formik.values.title}
          onChange={formik.handleChange}
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
