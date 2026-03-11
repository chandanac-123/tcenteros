import { DataTable } from '@common/components/DataTable'

const Expense = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Utilities'
    },
    {
      accessorKey: 'designation_name',
      header: 'Trainer Payouts'
    },
    {
      accessorKey: 'email',
      header: 'Vendor Payments'
    },
    {
      accessorKey: 'mobile',
      header: 'GST Credit'
    },
    {
      accessorKey: 'center_name',
      header: 'Payroll Date'
    },
    {
      accessorKey: 'center_name',
      header: 'Status'
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

export default Expense
