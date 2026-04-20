import CustomFilter from "@common/components/CustomeFilter";
import { DataTable } from "@common/components/DataTable";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Receipt,
  SignalHigh,
  UserPlus,
} from "lucide-react";

const CenterTable = () => {
  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    { accessorKey: "platform_commission", header: "Billing" },
    { accessorKey: "platform_commission", header: "Monthly Revenue " },
    { accessorKey: "platform_commission", header: "Renewal Date" },
    { accessorKey: "platform_commission", header: "Days left" },
    { accessorKey: "platform_commission", header: "Status" },
    { accessorKey: "platform_commission", header: "Partner" },
    { accessorKey: "platform_commission", header: "Total Revenue" },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex">
          <button
            className="px-3 py-1 text-xs  items-center justify-center rounded-xl border"
            // onClick={() =>
            //   navigate(
            //     `/subscriptions/active-subscriptions/detail/${row.original.id}`,
            //   )
            // }
          >
            View
          </button>
        </div>
      ),
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
        data={[]}
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
