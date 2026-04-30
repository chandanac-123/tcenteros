import { DataTable } from "@common/components/DataTable";
import { useAppPermissions } from "@hooks/index";
import { Badge } from "@pages/components/ui/badge";
import { useNavigate } from "react-router-dom";

const billingVariant = { yearly: "follow_up", monthly: "future_lead" };
const statusVariant = {
  active: "active",
  due: "inactive",
  // grace: "future_lead",
  overdue: "suspended",
};

const ActiveSubcriptionTable = ({
  data,
  tableParams,
  setTableParams,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { hydrated, canActiveSubscriptionView } = useAppPermissions();
  if (!hydrated) return null;
  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    { accessorKey: "center_phone", header: "Phone" },
    {
      accessorKey: "partner_name",
      header: "Partner Name",
      cell: ({ row }) => row.original.partner_name || "_ _",
    },
    { accessorKey: "renewal_date", header: "Renewal Date" },
    {
      accessorKey: "days_left_for_renewal",
      header: "Days left",
      cell: ({ row }) => {
        const days = row.original.days_left_for_renewal;
        let colorClass = "";
        if (days < 5) {
          colorClass = "text-red_text border-red_text";
        } else if (days <= 10) {
          colorClass = "text-yellow border-yellow-500";
        } else {
          colorClass = "text-green_text border-green_text";
        }
        return (
          <span
            className={`font-medium ${colorClass} text-xs border px-2 rounded-md`}
          >
            {days !== null && days !== undefined ? `${days} d` : "N/A"}
          </span>
        );
      },
    },
    {
      accessorKey: "subscription_duration",
      header: "Subscription Billing",
      cell: ({ row }) => {
        const billing = row.original.subscription_duration;
        return (
          <Badge
            label={
              billing === "yearly"
                ? "Yearly"
                : billing === "monthly"
                  ? "Monthly"
                  : "Null"
            }
            variant={billingVariant[billing]}
          />
        );
      },
    },
    // {
    //   accessorKey: "current_month_revenue",
    //   header: "Monthly Revenue",
    //   cell: ({ row }) => {
    //     return (
    //       <span>
    //         {row.original.current_month_revenue
    //           ? `${row.original.current_month_revenue}`
    //           : "N/A"}
    //       </span>
    //     );
    //   },
    // },


    // { accessorKey: "total_revenue", header: "Total Revenue" },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex">
          <button
            disabled={!canActiveSubscriptionView}
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
    {
      accessorKey: "status",
      header: "Subscription Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            label={
              status === "active"
                ? "Active"
                : status === "due"
                  ? "Due"
                  : status === "overdue"
                    ? "Over Due"
                    : "_ _"
            }
            variant={statusVariant[status]}
          />
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.subscriptions || []}
      setTableParams={setTableParams}
      tableParams={tableParams}
      pagination={data?.pagination?.total}
      loading={isLoading}
      paginationVisibile={true}
      search={false}
    />
  );
};

export default ActiveSubcriptionTable;
