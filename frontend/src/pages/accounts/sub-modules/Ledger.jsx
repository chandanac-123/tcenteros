import { DataTable } from '@common/DataTable'

const Ledger = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Accounts Heads'
    },
    {
      accessorKey: 'designation_name',
      header: 'Date-wise Debit/Credit entries'
    },
    {
      accessorKey: 'email',
      header: 'Voucher IDs'
    },
    {
      accessorKey: 'mobile',
      header: 'Source Module'
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

export default Ledger
