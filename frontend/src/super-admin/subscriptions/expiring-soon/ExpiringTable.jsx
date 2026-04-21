import CustomFilter from "@common/components/CustomeFilter";
import { DataTable } from "@common/components/DataTable";

const ExpiringTable = ({ data, isLoading, tableParams, setTableParams }) => {
  console.log('data: ', data);
  const flattenedCenters = data?.flatMap(day => day.centers) || [];
  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    { accessorKey: "renewal_date", header: "Renewal Date" },
    { accessorKey: "renewal_amount", header: "Value" },
    { accessorKey: "days_left", header: "Days left" },
    { accessorKey: "status", header: "Partner" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <CustomFilter />
      <DataTable
        columns={columns}
        data={flattenedCenters || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={30}
        loading={isLoading}
        paginationVisibile={true}
        search={false}
      />
    </div>
  );
};

export default ExpiringTable;
