import { DataTable } from '@common/components/DataTable'
import CustomFilter from '@common/components/CustomeFilter'
import view from '@assets/form-icons/view.svg'
import { useGetAllSalesQuery } from '@api-queries/billing/Query'
import SaleViewPage from '../component/SaleView'
import { useState } from 'react'

const transactionTypes = [
  { value: 'membership', label: 'Membership' },
  { value: 'product', label: 'Product' },
  { value: 'network', label: 'Network' },
  { value: 'service', label: 'Service' }
]
const paymentTypes = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Others' },
]
const Sales = () => {
  const [open, setOpen] = useState(false)
  const [viewId, setViewId] = useState(null)
  const [tableParam, setTableParams] = useState({
    page: 1,
    payment_method: '',
    status: '',
    transaction_type: ''
  })
  const { data, isFetching } = useGetAllSalesQuery(tableParam)

  const columns = [
    { accessorKey: 'customer_name', header: 'Customer Name' },
    { accessorKey: 'invoice_number', header: 'Invoice' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'source', header: 'Source' },
    { accessorKey: 'date', header: ' Date' },
    { accessorKey: 'total_amount', header: 'Amount' },
    { accessorKey: 'payment_method', header: 'Payment Method' },
    { accessorKey: 'payment_status', header: 'Status' },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div>
          <button
            onClick={() => {
              setOpen(true)
              setViewId(row?.original.payment_order_id)
            }}
          >
            <img src={view} alt='view' className='w-6 h-6' />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <div className='w-full flex justify-between mb-4'>
        <span className='font-semibold text-lg'>Sale Listing</span>
        <div className='flex gap-1'>
          <CustomFilter filterName='Type' options={transactionTypes}/>
          <CustomFilter filterName='Payment Mode' options={paymentTypes}/>
        </div>
      </div>
      <DataTable columns={columns} data={data?.transactions || []} />
      <SaleViewPage open={open} setOpen={setOpen} id={viewId} />
    </div>
  )
}
export default Sales
