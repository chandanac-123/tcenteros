import { DataTable } from '@common/DataTable'
import { useState } from 'react'
import Card from '../components/Cards'
import { visitorType } from '@constants/visitors'
import { useVisitorQuery } from '@api-queries/crm/Query'
import { Button } from '@pages/components/ui/button'
import { useCrmStore } from '@store/tabStore'

const Visitors = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data } = useVisitorQuery(tableParams)
  const {
    setSelectedTab,
    setVisitorView,
    setMemberView,
    memberView,
    visitorView
  } = useCrmStore()

  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Member  Name'
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
              setVisitorView('add')
            }}
          >
            Convert to Member
          </Button>
        </span>
      )
    }
  ]
  return (
    <>
      <div className='grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {visitorType?.map(member => (
          <Card key={member.id} label={member.name} />
        ))}
      </div>
      <div className='flex justify-end mb-4'>
        {/* <Button
          size='addbutton'
          onClick={() => {
            setVisitorView('add')
            setSelectedTab(3)
          }}
        >
          + Add Visitor
        </Button> */}
      </div>


      <DataTable
        columns={columns}
        data={data?.visitors}
        setTableParams={setTableParams}
        tableParams={tableParams}
        search={false}
        paginationVisibile={true}
      />
    </>
  )
}

export default Visitors
