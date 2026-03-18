import { DataTable } from '@common/components/DataTable'
import deleteicon from '@assets/form-icons/delete.svg'
import view from '@assets/form-icons/view.svg'
import { useIncomingNetworkQuery } from '@api-queries/billing/Query'
import { useState } from 'react'

const IncomingNetwork = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: '',
  })
  const { data, isFetching } = useIncomingNetworkQuery(tableParams)
  const columns = [
    { accessorKey: 'member_name', header: 'Member Name' },
    { accessorKey: 'home_center_name', header: 'Home Center' },
    { accessorKey: 'visit_date', header: 'Visit Date' },
    { accessorKey: 'start_date', header: 'Start Date' },
    { accessorKey: 'end_date', header: 'End Date' },
    { accessorKey: 'total_charge', header: 'Charge' },
    { accessorKey: 'platform_fee_percentage', header: 'Fee(15%)' },
    { accessorKey: 'platform_fee', header: 'Platform fee' },
    { accessorKey: 'earn', header: 'Earn' },
    { accessorKey: 'status', header: 'Status' },
    {
      header: 'Actions',
      accessorKey: 'status',
      cell: ({ row }) => (
        <div className='flex gap-3'>
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
    <>
      <DataTable
        columns={columns}
        data={data?.visits || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        loading={isFetching}
        pagination={data?.total_records}
        paginationVisibile={true}
      />
    </>
  )
}
export default IncomingNetwork
