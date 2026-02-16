import { DataTable } from '@common/DataTable'

const Income = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Membership Income'
    },
    {
      accessorKey: 'designation_name',
      header: 'PT Income'
    },
    {
      accessorKey: 'email',
      header: 'Inventory Sales'
    },
    {
      accessorKey: 'mobile',
      header: 'Network Income'
    },
    {
      accessorKey: 'center_name',
      header: 'GST Collected'
    },
    {
      accessorKey: 'center_name',
      header: 'Payroll Date'
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

export default Income
