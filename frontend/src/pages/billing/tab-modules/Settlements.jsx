import { DataTable } from '@common/components/DataTable'
import view from '@assets/form-icons/view.svg'
import { useState } from 'react'
import { useSettlementsQuery } from '@api-queries/billing/Query'
import SettlementViewPage from '../component/SettlementView'
import { Button } from '@pages/components/ui/button'
import CompleteSettlement from '../component/CompleteSettlement'
import CustomFilter from '@common/components/CustomeFilter'
const paymentStatus = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' }
]
const periodTypes = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]
const Settlements = () => {
  const [open, setOpen] = useState(false)
  const [viewId, setViewId] = useState(null)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [completeId, setCompleteId] = useState(null)
  const [tableParams, setTableParams] = useState({
    page: 1,
    period_type: '',
    payment_status: ''
  })
  const { data, isFetching } = useSettlementsQuery(tableParams)

  const columns = [
    { accessorKey: 'period_label', header: 'Time Period' },
    { accessorKey: 'incoming_visits_total', header: 'Incoming' },
    { accessorKey: 'outgoing_visits_total', header: 'Outgoing' },
    { accessorKey: 'platform_fee_total', header: 'Platform Fee' },
    { accessorKey: 'net_amount', header: 'Net' },
    { accessorKey: 'status', header: 'Status' },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex gap-3'>
          <button
            onClick={() => {
              setOpen(true)
              setViewId(row?.original.period_key)
            }}
          >
            <img src={view} alt='view' className='w-6 h-6' />
          </button>
          <Button
            size='notificationbutton'
            onClick={() => {
              setCompleteOpen(true)
              setCompleteId(row?.original.period_key)
            }}
          >
            Mark as Completed
          </Button>
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
    <div className='gap-4'>
      <div className='flex justify-between mb-4'>
        <span className='font-semibold text-lg'>Settlements Listing</span>
        <div className='flex gap-1'>
          <CustomFilter
            filterName='Type'
            options={paymentStatus}
            value={tableParams.payment_status}
            onApply={value => updateFilter('payment_status', value)}
          />

          <CustomFilter
            filterName='Period Type'
            options={periodTypes}
            value={tableParams.period_type}
            onApply={value => updateFilter('period_type', value)}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data?.settlements || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        loading={isFetching}
        pagination={data?.total}
        paginationVisibile={true}
        search={false}
      />
      <SettlementViewPage open={open} setOpen={setOpen} id={viewId} />
      <CompleteSettlement
        open={completeOpen}
        setOpen={setCompleteOpen}
        id={completeId}
      />
    </div>
  )
}
export default Settlements
