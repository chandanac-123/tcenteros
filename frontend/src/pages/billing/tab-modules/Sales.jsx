import { DataTable } from '@common/components/DataTable'
import CustomFilter from '@common/components/CustomeFilter'
import view from '@assets/form-icons/view.svg'
import { useGetAllSalesQuery } from '@api-queries/center-admin/billing/Query'
import SaleViewPage from '../component/SaleView'
import { useState } from 'react'
import { Badge } from '@pages/components/ui/badge'
const paymentVariantMap = { paid: 'active', null: 'inactive' }
const transactionTypes = [
  { value: 'membership', label: 'Membership' },
  { value: 'product', label: 'Product' },
  { value: 'network', label: 'Network' },
  { value: 'service', label: 'Service' }
]
const paymentTypes = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Others' }
]
const Sales = () => {
  const [open, setOpen] = useState(false)
  const [viewId, setViewId] = useState(null)
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: '',
    payment_method: '',
    transaction_type: ''
  })
  const { data, isFetching } = useGetAllSalesQuery(tableParams)

  const columns = [
    { accessorKey: 'customer_name', header: 'Customer Name' },
    { accessorKey: 'invoice_number', header: 'Invoice' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'date', header: ' Date' },
    { accessorKey: 'subtotal_amount', header: 'Amount' },
    { accessorKey: 'tax_amount', header: 'Tax Amount' },
    { accessorKey: 'total_amount', header: 'Total Amount' },
    { accessorKey: 'payment_method', header: 'Payment Method' },
    { accessorKey: 'payment_status', header: 'Status' ,
       cell: ({ row }) => (
        <span className='flex gap-3'>
          <Badge
            label={row.original.payment_status.replace('_', ' ').toUpperCase()}
            variant={paymentVariantMap[row.original.payment_status] || 'inactive'}
          />
        </span>
      )
    },
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
            <img src={view} alt='view' className='w-6 h-6' loading="lazy" />
          </button>
        </div>
      )
    }
  ]

  const updateFilter = (key, value) => {
    setTableParams(prev => ({
      ...prev,
      page: 1,
      [key]: value
    }))
  }
  return (
    <div>
      <div className='w-full flex justify-between mb-4'>
        <span className='font-semibold text-lg'>Sale Listing</span>
        <div className='flex gap-1'>
          <CustomFilter
            filterName='Type'
            options={transactionTypes}
            value={tableParams.transaction_type}
            onApply={value => updateFilter('transaction_type', value)}
          />

          <CustomFilter
            filterName='Payment Mode'
            options={paymentTypes}
            value={tableParams.payment_method}
            onApply={value => updateFilter('payment_method', value)}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data?.transactions || []}
        tableParams={tableParams}
        setTableParams={setTableParams}
        pagination={data?.total}
        paginationVisibile={true}
      />
      <SaleViewPage open={open} setOpen={setOpen} id={viewId} />
    </div>
  )
}
export default Sales
