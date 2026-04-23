import { DataTable } from "@common/components/DataTable";
import { Badge } from "@pages/components/ui/badge";
import React from "react";
const statusVariant = { paid: "active", unpaid: "inactive" };

const EarningPayoutTable = ({
  data,
  tableParams,
  setTableParams,
  isLoading,
}) => {
  const columns = [
    { accessorKey: "transaction_id", header: "TR ID" },
    { accessorKey: "lead_name", header: "Lead Name" },
    { accessorKey: "mobile", header: "Contact" },
    { accessorKey: "transaction_date", header: "Transaction Date" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "commission", header: "Commission" },
    {
      accessorKey: "status",
      header: "Status",
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
