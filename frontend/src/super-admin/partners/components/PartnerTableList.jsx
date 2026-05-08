import { DataTable } from "@common/components/DataTable";
import { useAppPermissions } from "@hooks/index";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import { useNavigate } from "react-router-dom";
import { Building2, IndianRupee, Users, Wallet } from "lucide-react";
const PartnerTableList = ({ data, tableParams, setTableParams, isLoading }) => {
  const { hydrated, canPartnerView } = useAppPermissions();
  if (!hydrated) return null;
  const navigate = useNavigate();

  const columns = [
    { accessorKey: "partner_name", header: "Partner Name" },
    {
      accessorKey: "city",
      header: "Region",
      // cell: ({ row }) => {
      //   return (
      //     <span className="px-2 py-1 rounded-md bg-blue-700/10 text-blue-700 text-xs">
      //       {row.getValue("city")}
      //     </span>
      //   );
      // },
    },
    { accessorKey: "number_of_centers", header: "Number of Centers" },
    { accessorKey: "active_centers", header: "Active Centers" },
    { accessorKey: "commission_earned", header: "Commission Earned" },
    { accessorKey: "total_revenue", header: "Total Revenue" },
    { accessorKey: "pending_payout", header: "Pending Payout" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")?.toLowerCase();

        const styles = {
          active: "bg-[#DEF4E6] text-[#34C759]",
          inactive: "bg-[#E0DDD8] text-[#555555]",
        };

        return (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original.partner_id;
        return (
          <button
            disabled={!canPartnerView}
            onClick={() => navigate(`/partnersbyId/${id}`)}
            className="px-3 py-1 text-xs border border-[#DAD9D9] rounded-full hover:bg-gray-100"
          >
            View
          </button>
        );
      },
    },
  ];

  const cardsData = [
    {
      label: "Total Number Of Partner",
      value: data?.summary?.total_partners,
      icon: <Users />,
    },
    {
      label: "Total Number Of Centers",
      value: data?.summary?.total_centers_through_partners,
      icon: <Building2 />,
    },
    {
      label: "Total Revenue",
      value: data?.summary?.total_revenue,
      icon: <IndianRupee />,
      type: "amount",
    },
    {
      label: "Pending Payout",
      value: data?.summary?.pending_payouts,
      icon: <Wallet />,
      type: "amount",
    },
  ];
  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <HeaderCard cardsData={cardsData} />
      </div>
      <div className="shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4 gap-4">
        <DataTable
          columns={columns}
          data={data?.partners || []}
          loading={isLoading}
          tableParams={tableParams}
          setTableParams={setTableParams}
          pagination={11}
          paginationVisibile={true}
        />
      </div>
    </div>
  );
};

export default PartnerTableList;
