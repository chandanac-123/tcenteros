import { DataTable } from '@common/components/DataTable'

const Payroll = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Employee Salaries'
    },
    {
      accessorKey: 'designation_name',
      header: 'Paid'
    },
    {
      accessorKey: 'email',
      header: 'Payroll Month-wise Summary'
    },
    {
      accessorKey: 'mobile',
      header: 'Payroll Date'
    },
    {
      accessorKey: 'center_name',
      header: 'Approval Status'
    },
    {
      accessorKey: 'center_name',
      header: 'Action'
    }
  ]
  return (
    <>
      <DataTable columns={columns} data={[]} />
    </>
  )
}

export default Payroll
