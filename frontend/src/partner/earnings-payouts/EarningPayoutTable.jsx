import { DataTable } from "@common/components/DataTable";
import React from "react";

const EarningPayoutTable = ({
  data,
  tableParams,
  setTableParams,
  isLoading,
}) => {
  const columns = [
    {
      accessorKey: "transaction_id",
      header: "TR ID",
    },
    {
      accessorKey: "lead_name",
      header: "Lead Name",
    },
    {
      accessorKey: "mobile",
      header: "Contact",
    },
    {
      accessorKey: "transaction_date",
      header: "Transaction Date",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")?.toLowerCase();

        const styles = {
          contacted: "bg-[#FFFED5] text-[#885503]",
          new: "bg-[#D5FFE7] text-[#03881C]",
          demo: "bg-[#E5D3F5] text-[#561290]",
          lost: "bg-[#FFD7D5] text-[#880303]",
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
    <div>
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

export default EarningPayoutTable;
