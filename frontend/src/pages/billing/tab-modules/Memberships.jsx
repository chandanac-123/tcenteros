import { DataTable } from '@common/components/DataTable'
import deleteicon from '@assets/form-icons/delete.svg'
import view from '@assets/form-icons/view.svg'
import { useState } from 'react'
import RenewMembership from '../component/RenewMembership'
import { useGetAllMembershipsQuery } from '@api-queries/billing/Query'

const Memberships = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const [renewOpen, setRenewOpen] = useState(false)
  const { data, isFetching } = useGetAllMembershipsQuery(tableParams)

  const columns = [
    { accessorKey: 'member_name', header: 'Member Name' },
    { accessorKey: 'plan_name', header: 'Plan' },
    { accessorKey: 'start_date', header: 'Start Date' },
    { accessorKey: 'end_date', header: 'End Date' },
    { accessorKey: 'expiry_date', header: 'Expiry Date' },
    { accessorKey: 'days_until_expiry', header: 'Days until expiry' },
    { accessorKey: 'total_amount', header: 'Amount' },
    { accessorKey: 'renewal_status', header: 'Status' },
    {
      header: 'Actions',
      accessorKey: 'status',
      cell: ({ row }) => (
        <div className='flex gap-3'>
          <button
            className='border-2 border-primary rounded-md px-4 py-1 text-primary'
            onClick={() => setRenewOpen(true)}
          >
            Renew
          </button>
          <button>
            <img src={view} alt='view' />
          </button>
          <button>
            <img src={deleteicon} alt='delete' />
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
      <RenewMembership open={renewOpen} setOpen={setRenewOpen} />
    </div>
  )
}
export default Memberships
