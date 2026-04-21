import CustomFilter from "@common/components/CustomeFilter";
import { DataTable } from "@common/components/DataTable";
import { Badge } from "@pages/components/ui/badge";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import { Briefcase, Building2, SignalHigh, UserPlus } from "lucide-react";
const billingVariant = { yearly: "follow_up", monthly: "future_lead" };
const statusVariant = {
  active: "active",
  inactive: "inactive",
  grace: "future_lead",
  suspended: "suspended",
};
const CenterTable = ({ data, tableParams, setTableParams, isLoading }) => {
  console.log("data: ", data);
  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    {
      accessorKey: "subscription_duration",
      header: "Billing",
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
    {
      accessorKey: "current_month_revenue",
      header: "Monthly Revenue",
      cell: ({ row }) => {
        return (
          <span>
            {row.original.current_month_revenue
              ? `$${row.original.current_month_revenue}`
              : "N/A"}
          </span>
        );
      },
    },
    ,
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            label={
              status === "active"
                ? "Active"
                : status === "inactive"
                  ? "Inactive"
                  : status === "grace"
                    ? "Grace"
                    : status === "suspended"
                      ? "Suspended"
                      : "Null"
            }
            variant={statusVariant[status]}
          />
        );
      },
    },
    { accessorKey: "partner", header: "Partner" },
    { accessorKey: "total_revenue", header: "Total Revenue" },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex">
          <button className="px-3 py-1 text-xs items-center justify-center rounded-xl border">
            View
          </button>
        </div>
      ),
    },
  ];

  const cardsData = [
    {
      label: "Total Number Of Centers",
      value: data?.summary?.total_centers,
      icon: <Building2 size={16} strokeWidth={2.75} />,
    },
    {
      label: "Total Number Of Members",
      value: data?.summary?.total_members,
      icon: <UserPlus size={16} strokeWidth={2.75} />,
    },
    {
      label: "Total Revenue",
      value: data?.summary?.total_platform_revenue,
      icon: <Briefcase size={16} strokeWidth={2.75} />,
    },
    {
      label: "Average Growth",
      value: data?.summary?.average_growth_percentage,
      icon: <SignalHigh size={16} strokeWidth={2.75} />,
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <HeaderCard cardsData={cardsData} />
      </div>

      {/* <div className="pe-5 justify-end flex">
        <CustomFilter filterName="Status" />
      </div> */}
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
    </div>
  );
};

export default CenterTable;
