import { DataTable } from '@common/DataTable'

const EmployeeTable = ({ data,  pagination, tableParams, setTableParams}) => {

   const columns = [
  {
    accessorKey: 'status',
    header: 'first Name'
  },
  {
    accessorKey: 'email',
    header: 'Last Name'
  },
  {
    accessorKey: 'amount',
    header: 'Designation'
  },
  {
    accessorKey: 'amount',
    header: 'Email'
  },
  {
    accessorKey: 'amount',
    header: 'Phone number'
  },
  {
    accessorKey: 'amount',
    header: 'Center'
  },
  {
    accessorKey: 'amount',
    header: 'Join Date'
  },
  {
    accessorKey: 'amount',
    header: 'Status'
  }
]


  return (
    <>
      <DataTable
        title='Products'
        subTitle='Products'
        total={pagination?.totalCount}
        columns={columns}
        data={data}
        pagination={pagination}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
    </>
  )
}
export default EmployeeTable
