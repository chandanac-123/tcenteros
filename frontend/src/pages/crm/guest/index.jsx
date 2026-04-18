import { DataTable } from '@common/components/DataTable'
import { useState } from 'react'
import { useGuestQuery } from '@api-queries/crm/Query'
import { Button } from '@pages/components/ui/button'
import { useCrmStore } from '@store/tabStore'
import { useAppPermissions } from '@hooks/permissions'

const Guest = () => {
  const { hydrated, canConvertGuest } = useAppPermissions()
  if (!hydrated) return null
  const [tableParams, setTableParams] = useState({
    page: 1
  })
  const { data, isLoading, error } = useGuestQuery(tableParams)
  const { setSelectedTab, setMemberView, setSelectedGuestId } = useCrmStore()

  const columns = [
    { accessorKey: 'full_name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile', header: 'Phone Number' },
    {
      header: 'Action',
      accessorKey: '',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <Button
            disabled={!canConvertGuest}
            size='notificationbutton'
            onClick={() => {
              setSelectedGuestId(row.original.id)
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
        data={data?.guests}
        setTableParams={setTableParams}
        tableParams={tableParams}
        loading={isLoading}
        pagination={data?.total_records}
        paginationVisibile={true}
        search={false}
      />
    </div>
  )
}

export default Guest
