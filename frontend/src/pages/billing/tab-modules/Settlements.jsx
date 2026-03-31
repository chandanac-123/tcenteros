import { DataTable } from '@common/components/DataTable'
import view from '@assets/form-icons/view.svg'
import { useState } from 'react'
import { useSettlementsQuery } from '@api-queries/billing/Query'
import SettlementViewPage from '../component/SettlementView'
import { Button } from '@pages/components/ui/button'
import CompleteSettlement from '../component/CompleteSettlement'
import CustomFilter from '@common/components/CustomeFilter'
import { formatDate } from '@utils/helper'
import { Badge } from '@pages/components/ui/badge'
const paymentStatus = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' }
]
const periodTypes = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]
const flowVariantMap = {
  in: 'active', // green
  out: 'inactive' // red
}

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
    {
      accessorKey: 'settlement_type',
      header: 'Settlement Type',
      cell: ({ row }) => {
        const type = row.original.settlement_type
        const formatted = type
          ?.replace(/_/g, ' ') // remove underscore
          ?.replace(/\b\w/g, l => l.toUpperCase()) // capitalize words
        return <span>{formatted}</span>
      }
    },
    {
      accessorKey: 'money_flow',
      header: 'Settlement Flow',
      cell: ({ row }) => {
        const flow = row.original.money_flow
        return (
          <Badge
            label={flow === 'in' ? 'Incoming' : 'Outgoing'}
            variant={flowVariantMap[flow]}
          />
        )
      }
    },
    {
      accessorKey: 'settlement_date',
      header: 'Settlement Date',
      cell: ({ row }) => {
        return <span>{formatDate(row.original.settlement_date)}</span>
      }
    },
    { accessorKey: 'amount', header: 'Settled Amount' }
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
        data={data || []}
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
