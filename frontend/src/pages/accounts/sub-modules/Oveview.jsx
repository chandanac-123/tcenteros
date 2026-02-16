import { DataTable } from "@common/DataTable"

 
const Overview = () => {
   const columns = [
    {
      accessorKey: 'full_name',
      header: 'Center Name'
    },
    {
      accessorKey: 'designation_name',
      header: 'Total Revenue'
    },
    {
      accessorKey: 'email',
      header: 'Net Profit'
    },
    {
      accessorKey: 'mobile',
      header: 'Cash/Bank Balance'
    },
    {
      accessorKey: 'center_name',
      header: 'Transaction Date'
    },
    {
      accessorKey: 'joining_date',
      header: 'Payroll Date'
    },
    {
      accessorKey: 'joining_date',
      header: 'Action'
    }
  ]

  return (
    <>
    <DataTable
           columns={columns}
           data={[]}
         />
    </>
  )
}

export default Overview
