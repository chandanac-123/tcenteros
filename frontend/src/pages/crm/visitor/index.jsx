import { DataTable } from '@common/components/DataTable'
import { useState } from 'react'
import { useVisitorQuery } from '@api-queries/center-admin/crm/Query'
import { Button } from '@pages/components/ui/button'
import { useCrmStore } from '@store/tabStore'
import { useAppPermissions } from '@hooks/index'

const Visitors = () => {
  const { hydrated, canConvertVisitor } = useAppPermissions()
  if (!hydrated) return null
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isFetching } = useVisitorQuery(tableParams)
  const { setSelectedTab, setMemberView, setSelectedVisitorId } = useCrmStore()

  const columns = [
    { accessorKey: 'full_name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Phone Number' },
    { accessorKey: 'visited_date', header: 'Visited Date' },
    {
      header: 'Action',
      accessorKey: '',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <Button
            disabled={!canConvertVisitor}
            size='notificationbutton'
            onClick={() => {
              setSelectedTab(1)
              setSelectedVisitorId(row.original.id)
              setMemberView('add')
            }}
          >
            Convert to Member
          </Button>
        </span>
      )
    }
  ]
  return (
    <div className='flex flex-col mt-4'>
      <DataTable
        columns={columns}
        data={data?.visitors}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={data?.total}
        search={false}
        loading={isFetching}
        paginationVisibile={true}
      />
    </div>
  )
}

export default Visitors
