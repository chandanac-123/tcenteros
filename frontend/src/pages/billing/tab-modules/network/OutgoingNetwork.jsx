import { DataTable } from '@common/components/DataTable'
import deleteicon from '@assets/form-icons/delete.svg'
import view from '@assets/form-icons/view.svg'
import { useOutgoingNetworkQuery } from '@api-queries/center-admin/billing/Query'
import { useState } from 'react'

const OutgoingNetwork = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isFetching } = useOutgoingNetworkQuery(tableParams)

  const columns = [
    { accessorKey: 'member_name', header: 'Member Name' },
    { accessorKey: 'visited_center_name', header: 'Visited Center' },
    { accessorKey: 'start_date', header: 'Start Date' },
    { accessorKey: 'end_date', header: 'End Date' },
    { accessorKey: 'platform_fee', header: 'Platform fee' },
    { accessorKey: 'total_charge', header: 'Total Charge' },
    { accessorKey: 'paid', header: 'Paid' }
    // {
    //   header: 'Actions',
    //   accessorKey: 'status',
    //   cell: ({ row }) => (
    //     <div className='flex gap-3'>
    //       <button>
    //         <img src={view} alt='view' />
    //       </button>
    //       <button>
    //         <img src={deleteicon} alt='delete' />
    //       </button>
    //     </div>
    //   )
    // }
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
export default OutgoingNetwork
