import { DataTable } from "@common/components/DataTable";
import { useNavigate } from "react-router-dom";

const ActiveSubcriptionTable = () => {
  const navigate = useNavigate();
  const columns = [
    { accessorKey: "full_name", header: "Center Name" },
    { accessorKey: "billing", header: "Billing" },
    { accessorKey: "monthly_revenue", header: "Monthly Revenue" },
    { accessorKey: "days_left", header: "Days left" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "partner", header: "Partner" },
    { accessorKey: "total_revenue", header: "Total Revenue" },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center justify-center rounded-xl border p-1">
          <button
            onClick={() =>
              navigate(
                `/subscriptions/active-subscriptions/detail/${row.original.id}`,
              )
            }
          >
            View
          </button>
        </div>
      ),
    },
  ];

  const data = [
    {
      id: 1,
      full_name: "Center One",
      billing: "2026-04-01",
      monthly_revenue: "₹50,000",
      days_left: 15,
      status: "Active",
      partner: "Partner A",
      total_revenue: "₹6,00,000",
      action: "View",
    },
    {
      id: 2,
      full_name: "Center Two",
      billing: "2026-03-15",
      monthly_revenue: "₹40,000",
      days_left: 5,
      status: "Expiring",
      partner: "Partner B",
      total_revenue: "₹4,80,000",
      action: "Renew",
    },
    {
      id: 3,
      full_name: "Center Three",
      billing: "2026-02-20",
      monthly_revenue: "₹60,000",
      days_left: 30,
      status: "Active",
      partner: "Partner C",
      total_revenue: "₹7,20,000",
      action: "View",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      // setTableParams={setTableParams}
      // tableParams={tableParams}
      // pagination={employees?.total}
      // loading={isEmployeesLoading}
      // paginationVisibile={true}
      // search={false}
    />
  );
};

export default ActiveSubcriptionTable;
