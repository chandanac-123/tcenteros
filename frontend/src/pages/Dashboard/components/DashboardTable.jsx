import { DataTable } from '@common/components/DataTable'

const DashboardTable = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Full Name'
    },
    {
      accessorKey: 'designation_name',
      header: 'Designation'
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
      accessorKey: 'joining_date',
      header: 'Join Date'
    }
  ]
  return <DataTable search={false} columns={columns} data={[]} />
}

export default DashboardTable
