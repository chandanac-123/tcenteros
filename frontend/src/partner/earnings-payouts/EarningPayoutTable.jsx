import { DataTable } from "@common/components/DataTable";
import { Badge } from "@pages/components/ui/badge";
import { formatTextDate } from "@utils/helper";
import React from "react";
const statusVariant = { paid: "active", unpaid: "inactive" };

const EarningPayoutTable = ({
  data,
  tableParams,
  setTableParams,
  isLoading,
}) => {
  const columns = [
    { accessorKey: "lead_name", header: "Lead Name" },
    { accessorKey: "mobile", header: "Contact" },
    {
      accessorKey: "transaction_date",
      header: "Transaction Date",
      cell: ({ row }) => {
        const transactionDate = row.original.transaction_date;
        return transactionDate ? formatTextDate(transactionDate) : "N/A";
      },
    },
    {
      accessorKey: "renewal_date",
      header: "Renewal Date",
      cell: ({ row }) => {
        const renewalDate = row.original.renewal_date;
        return renewalDate ? formatTextDate(renewalDate) : "N/A";
      },
    },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "partner_commission_amount", header: "Commission" },
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

export default EarningPayoutTable;
