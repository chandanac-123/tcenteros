import { DataTable } from "@common/components/DataTable";
import React from "react";

const NetworkTable = ({ data, loading, tableParams, setTableParams }) => {
  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    { accessorKey: "platform_commission", header: "Platform Commission" },
    { accessorKey: "date", header: "Commission Date" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")?.toLowerCase();
        const styles = {
          completed: "bg-[#DEF4E6] text-[#34C759]",
          pending: "bg-[#FFF3D5] text-[#F35D0D]",
        };
        return (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.results || []}
      loading={false}
      tableParams={tableParams}
      setTableParams={setTableParams}
      pagination={data?.total}
      paginationVisibile={true}
    />
  );
};

export default NetworkTable;
