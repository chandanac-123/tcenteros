import { DataTable } from "@common/components/DataTable"

const ActiveSubcriptionTable = () => {
     const columns = [
        { accessorKey: 'full_name', header: 'Center Name' },
        { accessorKey: 'date', header: 'Billing' },
        { accessorKey: 'designation', header: 'Monthly Revenue' },
        { accessorKey: 'duration', header: 'Days left' },
        { accessorKey: 'duration', header: 'Status' },
        { accessorKey: 'duration', header: 'Partner' },
        { accessorKey: 'duration', header: 'Total Revenue' },
        { accessorKey: 'duration', header: 'Action' }
      ]
  return (
     <DataTable
            columns={columns}
            data={ []}
            // setTableParams={setTableParams}
            // tableParams={tableParams}
            // pagination={employees?.total}
            // loading={isEmployeesLoading}
            // paginationVisibile={true}
            // search={false}
          />
  )
}

export default ActiveSubcriptionTable
