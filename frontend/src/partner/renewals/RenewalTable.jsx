import { DataTable } from "@common/components/DataTable";
import { Badge } from "@pages/components/ui/badge";
import React from "react";
const statusVariant = { paid: "active", unpaid: "inactive" };
const RenewalTable = ({ data, isLoading, tableParams, setTableParams }) => {
  console.log('data: ', data);
  const columns = [
    { accessorKey: "lead_name", header: "Lead Name" },
    { accessorKey: "mobile", header: "Contact" },
    { accessorKey: "center_name", header: "Center Name" },
    { accessorKey: "subscription_end_date", header: "Subscription End Date" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "commission", header: "Commission" },
    {
      accessorKey: "status",
      header: "Status",
      // cell: ({ row }) => {
      //   const status = row.getValue("status")?.toLowerCase();
      //   const styles = {
      //     contacted: "bg-[#FFFED5] text-[#885503]",
      //     new: "bg-[#D5FFE7] text-[#03881C]",
      //     demo: "bg-[#E5D3F5] text-[#561290]",
      //     lost: "bg-[#FFD7D5] text-[#880303]",
      //   };
      //   return (
      //     <span
      //       className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}
      //     >
      //       {status}
      //     </span>
      //   );
      // },

      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            label={status === "paid" ? "Paid" : "Unpaid"}
            variant={statusVariant[status]}
          />
        );
      },
    },
  ];

  return (
   <div className="shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4 mt-4">
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        tableParams={tableParams}
        setTableParams={setTableParams}
        pagination={data?.total}
        paginationVisibile={true}
        search={true}
      />
    </div>
  );
};

export default RenewalTable;
