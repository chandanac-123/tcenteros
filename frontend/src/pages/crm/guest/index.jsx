import { DataTable } from '@common/DataTable'
import { useState } from 'react'
import { useGuestQuery } from '@api-queries/crm/Query'
import { Button } from '@pages/components/ui/button'
import { useCrmStore } from '@store/tabStore'

const Guest = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
  })
  const { data } = useGuestQuery()
   const { setSelectedTab, setMemberView } = useCrmStore()
  console.log('data: ', data);

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
        data={data}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
        search={false}
      />
    </div>
  )
}

export default Guest
