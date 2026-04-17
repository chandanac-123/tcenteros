import { DataTable } from "@common/components/DataTable";

const ExpiringTable = () => {
    const columns = [
    { accessorKey: "full_name", header: "Center Name" },
    { accessorKey: "billing", header: "Renewal Date" },
    { accessorKey: "monthly_revenue", header: "Value" },
    { accessorKey: "days_left", header: "Days left" },
    { accessorKey: "status", header: "Partner" },    
  ];

  return (
    <div>
      <DataTable
            columns={columns}
            data={[]}
            // setTableParams={setTableParams}
            // tableParams={tableParams}
            // pagination={employees?.total}
            // loading={isEmployeesLoading}
            // paginationVisibile={true}
            search={false}
          />
    </div>
  )
}

export default ExpiringTable
