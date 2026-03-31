import { DataTable } from '@common/components/DataTable'
import { useState } from 'react'
import RenewMembership from '../component/RenewMembership'
import { useGetAllMembershipsQuery } from '@api-queries/billing/Query'
import { formatDate } from '@utils/helper'

const Memberships = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const [renewOpen, setRenewOpen] = useState(false)
  const [renewId, setRenewId] = useState(null)
  const { data, isFetching } = useGetAllMembershipsQuery(tableParams)

  const columns = [
    { accessorKey: 'member_name', header: 'Member Name' },
    { accessorKey: 'membership_name', header: 'Plan' },
    { accessorKey: 'member_mobile', header: 'Phone' },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => {
        return <span>{formatDate(row.original.start_date)}</span>
      }
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ row }) => {
        return <span>{formatDate(row.original.end_date)}</span>
      }
    },
    {
      accessorKey: 'days_until_expiry',
      header: `Day's until expiry`,
      cell: ({ row }) => {
        const days = row.original.days_until_expiry
        if (days < 0) {
          return (
            <span className='text-red-500'>
              Expired {Math.abs(days)} day's ago
            </span>
          )
        }
        if (days === 0) {
          return <span className='text-orange-500'>Expires today</span>
        }
        return <span className='text-green-600'>{days} day's</span>
      }
    },
    { accessorKey: 'total_amount', header: 'Amount' },
    {
      header: 'Actions',
      accessorKey: 'status',
      cell: ({ row }) => (
        <div className='flex gap-3'>
          <button
            className='border-2 border-primary rounded-md px-4 py-1 text-primary'
            onClick={() => {
              setRenewId(row.original.member_membership_id)
              setRenewOpen(true)
            }}
          >
            Renew
          </button>
        </div>
      )
    }
  ]
  return (
    <div className='gap-4 flex flex-col'>
      <span className='font-semibold text-lg'>Membership Listing</span>
      <DataTable
        columns={columns}
        data={data?.memberships || []}
        pagination={data?.total}
        paginationVisible={true}
        setTableParams={setTableParams}
        tableParams={tableParams}
        loading={isFetching}
      />
      <RenewMembership
        open={renewOpen}
        setOpen={setRenewOpen}
        membershipId={renewId}
      />
    </div>
  )
}
export default Memberships
