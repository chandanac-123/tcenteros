import { DataTable } from "@common/components/DataTable";
import { useNavigate } from "react-router-dom";

const ActiveSubcriptionTable = ({ data, tableParams, setTableParams }) => {
  const navigate = useNavigate();
  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    { accessorKey: "subscription_duration", header: "Billing" },
    { accessorKey: "current_month_revenue", header: "Monthly Revenue" },
    { accessorKey: "days_left_for_renewal", header: "Days left" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "partner", header: "Partner" },
    { accessorKey: "total_revenue", header: "Total Revenue" },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex">
          <button
            className="px-3 py-1 text-xs  items-center justify-center rounded-xl border"
            onClick={() =>
              navigate(
                `/subscriptions/active-subscriptions/detail/${row.original.center_id}`,
              )
            }
          >
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.subscriptions || []}
      setTableParams={setTableParams}
      tableParams={tableParams}
      // pagination={employees?.total}
      // loading={isEmployeesLoading}
      paginationVisibile={true}
      search={false}
    />
  );
};

export default ActiveSubcriptionTable;
