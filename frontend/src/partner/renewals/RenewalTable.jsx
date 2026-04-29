import { DataTable } from "@common/components/DataTable";
import { Badge } from "@pages/components/ui/badge";
import React from "react";
const statusVariant = { paid: "active", unpaid: "inactive" };

const RenewalTable = ({ data, isLoading, tableParams, setTableParams }) => {
  const columns = [
    { accessorKey: "center_name", header: "Lead Name" },
    { accessorKey: "contact_number", header: "Contact Number" },
    { accessorKey: "renewal_date", header: "Subscription End Date" },
    {
      accessorKey: "days_left",
      header: "Days left",
      cell: ({ row }) => {
        const days = row.original.days_left;
        let colorClass = "";
        if (days < 5) {
          colorClass = "text-red_text border-red_text";
        } else if (days <= 10) {
          colorClass = "text-partner_yellow border-partner_yellow";
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
    { accessorKey: "subscription_amount", header: "Amount" },
    { accessorKey: "commission_amount", header: "Commission" },
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
