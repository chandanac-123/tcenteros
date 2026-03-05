import { DataTable } from '@common/DataTable'
import { useState } from 'react'
import { useVisitorQuery } from '@api-queries/crm/Query'
import { Button } from '@pages/components/ui/button'
import { useCrmStore } from '@store/tabStore'

const Visitors = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data } = useVisitorQuery(tableParams)
  const { setSelectedTab, setMemberView } = useCrmStore()

  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Name'
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },

    {
      accessorKey: 'mobile',
      header: 'Phone Number'
    },
    {
      accessorKey: 'visited_date',
      header: 'Visited Date'
    },
    {
      header: 'Action',
      accessorKey: '',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <Button
            size='addbutton'
            onClick={() => {
              setSelectedTab(1)
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
        search={false}
        paginationVisibile={true}
      />
    </div>
  )
}

export default Visitors
