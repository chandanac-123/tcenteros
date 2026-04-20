import CustomFilter from "@common/components/CustomeFilter";
import { DataTable } from "@common/components/DataTable";
import { Badge } from "@pages/components/ui/badge";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import { Briefcase, Building2, SignalHigh, UserPlus } from "lucide-react";
const statusVariant = {
  in: "active",
  out: "inactive",
};
const billingVariant = {
  in: "active",
  out: "inactive",
};
const CenterTable = () => {
  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    {
      accessorKey: "billing",
      header: "Billing",
      cell: ({ row }) => {
        const billing = row.original.billing;
        return (
          <Badge
            label={billing === "in" ? "Incoming" : "Outgoing"}
            variant={billingVariant[billing]}
          />
        );
      },
    },
    { accessorKey: "monthly_revenue", header: "Monthly Revenue" },
    { accessorKey: "renewal_date", header: "Renewal Date" },
    {
      accessorKey: "days_left",
      header: "Days Left",
      cell: ({ row }) => {
        const billing = row.original.billing;
        return (
          <div className="flex items-center gap-2">
            label={billing === "in" ? "Incoming" : "Outgoing"}
            variant={billingVariant[billing]}
          </div>
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
            label={status === "in" ? "Incoming" : "Outgoing"}
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

  const data = [
    {
      id: 1,
      center_name: "FitZone Kochi",
      billing: "Yearly",
      monthly_revenue: "₹1,20,000",
      renewal_date: "2026-05-10",
      days_left: 20,
      status: "Active",
      partner: "Gold",
      total_revenue: "₹8,50,000",
    },
    {
      id: 2,
      center_name: "PowerHouse Gym",
      billing: "Monthly",
      monthly_revenue: "₹95,000",
      renewal_date: "2026-04-28",
      days_left: 8,
      status: "Grace",
      partner: "Silver",
      total_revenue: "₹6,20,000",
    },
    {
      id: 3,
      center_name: "Muscle Factory",
      billing: "Yearly",
      monthly_revenue: "₹80,000",
      renewal_date: "2026-04-22",
      days_left: 2,
      status: "Expiring Soon",
      partner: "Due",
      total_revenue: "₹4,75,000",
    },
    {
      id: 4,
      center_name: "Elite Fitness Club",
      billing: "Yearly",
      monthly_revenue: "₹1,50,000",
      renewal_date: "2026-06-15",
      days_left: 55,
      status: "Suspended",
      partner: "Gold",
      total_revenue: "₹10,20,000",
    },
    {
      id: 5,
      center_name: "Iron Paradise",
      billing: "Monthly",
      monthly_revenue: "₹60,000",
      renewal_date: "2026-04-18",
      days_left: 0,
      status: "Failed",
      partner: "Basic",
      total_revenue: "₹3,10,000",
    },
  ];

  const cardsData = [
    {
      label: "Total Number Of Centers",
      value: 0,
      icon: <Building2 size={16} strokeWidth={2.75} />,
    },
    {
      label: "Total Number Of Members",
      value: 0,
      icon: <UserPlus size={16} strokeWidth={2.75} />,
    },
    {
      label: "Total Revenue",
      value: 0,
      icon: <Briefcase size={16} strokeWidth={2.75} />,
    },
    {
      label: "Average Growth",
      value: 0,
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
        data={data}
        loading={false}
        // tableParams={tableParams}
        // setTableParams={setTableParams}
        pagination={11}
        paginationVisibile={true}
      />
    </div>
  );
};

export default CenterTable;
