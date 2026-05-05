import { DataTable } from "@common/components/DataTable";
import { useAppPermissions } from "@hooks/index";
import { Badge } from "@pages/components/ui/badge";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const billingVariant = { yearly: "follow_up", monthly: "future_lead" };
const statusVariant = {
  active: "active",
  due: "inactive",
  grace: "future_lead",
  overdue: "suspended",
};

const ActiveSubcriptionTable = ({
  data,
  tableParams,
  setTableParams,
  isLoading,
}) => {
  // console.log("Data", data);
  // const data = [
  //   {
  //     center_id: "1",
  //     center_name: "Center Alpha",
  //     center_email: "alpha@gmail.com",
  //     center_phone: "9876543210",
  //     contact_person: "Rahul",
  //     center_status: "active",
  //     center_member_count: 25,
  //     current_month_revenue: 1200,
  //     total_revenue: 15000,
  //     days_left_for_renewal: 2,
  //     renewal_date: "2026-05-03",
  //     subscription_duration: "monthly",
  //     status: "due",
  //     partner_name: null,
  //   },
  //   {
  //     center_id: "2",
  //     center_name: "Center Beta",
  //     center_email: "beta@gmail.com",
  //     center_phone: "9123456780",
  //     contact_person: "Anjali",
  //     center_status: "active",
  //     center_member_count: 40,
  //     current_month_revenue: 2500,
  //     total_revenue: 32000,
  //     days_left_for_renewal: 0,
  //     renewal_date: "2026-05-01",
  //     subscription_duration: "yearly",
  //     status: "graced",
  //     partner_name: "FitPartner",
  //   },
  //   {
  //     center_id: "3",
  //     center_name: "Center Gamma",
  //     center_email: "gamma@gmail.com",
  //     center_phone: "9988776655",
  //     contact_person: "Arjun",
  //     center_status: "inactive",
  //     center_member_count: 10,
  //     current_month_revenue: 500,
  //     total_revenue: 8000,
  //     days_left_for_renewal: -3,
  //     renewal_date: "2026-04-28",
  //     subscription_duration: "monthly",
  //     status: "due",
  //     partner_name: null,
  //   },
  //   {
  //     center_id: "4",
  //     center_name: "Center Delta",
  //     center_email: "delta@gmail.com",
  //     center_phone: "9090909090",
  //     contact_person: "Meera",
  //     center_status: "active",
  //     center_member_count: 60,
  //     current_month_revenue: 4000,
  //     total_revenue: 50000,
  //     days_left_for_renewal: 5,
  //     renewal_date: "2026-05-06",
  //     subscription_duration: "yearly",
  //     status: "graced",
  //     partner_name: "WellnessHub",
  //   },
  // ];

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
            <Eye color="gray" />
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
              status === "grace"
                ? "Grace"
                : status === "active"
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
      // data={data}
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
