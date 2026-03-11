import { DataTable } from "@common/components/DataTable"

const Taxes = () => {
  const columns = [
    {
      accessorKey: 'full_name',
      header: 'GST Collected'
    },
    {
      accessorKey: 'designation_name',
      header: 'GST Paid'
    },
    {
      accessorKey: 'email',
      header: 'GST Payable'
    },
    {
      accessorKey: 'mobile',
      header: 'Payroll Date'
    },
    {
      accessorKey: 'center_name',
      header: 'Tax Period Reports'
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

export default Taxes
