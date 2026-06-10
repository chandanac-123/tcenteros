import { DataTable } from "@common/components/DataTable";
import React from "react";

const AssignedCenterTable = ({ data }) => {
  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    { accessorKey: "commission_earned", header: "Commission Amount" },
    { accessorKey: "renewal_date", header: "Renewal Date" },
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
  ];

  return (
    <div>
      <div className="shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4">
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
    </div>
  );
};

export default AssignedCenterTable;
