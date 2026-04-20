import { DataTable } from "@common/components/DataTable";

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
  return (
    <div>
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
