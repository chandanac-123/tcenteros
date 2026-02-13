import { DataTable } from '@common/DataTable'
import { Badge } from '@pages/components/ui/badge'
import { useState } from 'react'
import { useDeleteEmployeeMutation } from '@api-queries/employee-management/Query'
import Card from '../components/Cards'
import { leadsType } from '@constants/leads'
import { date } from 'yup'

const Leads = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 3,
    search: ''
  })

  // Dummy data for DataTable
  const data = [
    {
      id: 1,
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      mobile: '9876543210',
      status: 'active',
      date: '2024-06-10'
    },
    {
      id: 2,
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      mobile: '9123456780',
      status: 'inactive',
      date: '2024-06-10'
    },
    {
      id: 3,
      full_name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      mobile: '9988776655',
      status: 'pending',
      date: ''
    },
    {
      id: 3,
      full_name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      mobile: '9988776655',
      status: 'fullfilled',
      date: '2024-06-10'
    },
    {
      id: 3,
      full_name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      mobile: '9988776655',
      status: 'followwup',
      date: '2024-06-10'
    }
  ]

  const statusVariantMap = {
    active: 'active',
    inactive: 'inactive',
    pending: 'pending',
    fullfilled: 'future_lead', // map to blue
    followwup: 'follow_up' // map to purple
  }

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
      accessorKey: 'mobile',
      header: 'Source'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <Badge
            label={row.original.status.replace('_', ' ').toUpperCase()}
            variant={statusVariantMap[row.original.status] || 'inactive'}
          />
        </span>
      )
    },
    {
      header: 'Followup date',
      accessorKey: 'date'
    }
  ]

  return (
    <>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6'>
        {leadsType?.map(member => (
          <Card key={member.id} label={member.name} />
        ))}
      </div>

      <DataTable
        title='Products'
        subTitle='Products'
        columns={columns}
        data={data}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
    </>
  )
}

export default Leads
