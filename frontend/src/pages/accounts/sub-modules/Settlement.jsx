import { DataTable } from '@common/DataTable'

const Settlement = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Trainer Commissions'
    },
    {
      accessorKey: 'designation_name',
      header: 'Commissions'
    },
    {
      accessorKey: 'email',
      header: 'Network Settlements'
    },
    {
      accessorKey: 'mobile',
      header: 'Payroll Date'
    },
    {
      accessorKey: 'center_name',
      header: 'Paid Status'
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

export default Settlement
