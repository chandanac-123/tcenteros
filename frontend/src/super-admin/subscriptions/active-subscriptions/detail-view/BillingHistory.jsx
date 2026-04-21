import { useBillingHistoryQuery } from "@api-queries/super-admin/subcriptions/Query";
import { DataTable } from "@common/components/DataTable";
import { Badge } from "@pages/components/ui/badge";
import { formatDate } from "@utils/helper";
import React, { useState } from "react";

const statusVariant = {
  active: "active",
  inactive: "inactive",
};
const BillingHistory = ({ data }) => {
  console.log("data: ", data);

  const columns = [
    { accessorKey: "invoice_number", header: "Invoice Number" },
    {
      accessorKey: "subscription_duration",
      header: "Subscription Duration",
      cell: ({ row }) => {
        const text = row.original.subscription_duration || "";
        const result = text.charAt(0).toUpperCase() + text.slice(1);
        return <span>{result}</span>;
      },
    },
    {
      accessorKey: "subscription_duration",
      header: "Period",
      cell: ({ row }) => {
        return (
          <span>
            {formatDate(row.original.subscription_period?.start_date)} -{" "}
            {formatDate(row.original.subscription_period?.end_date)}
          </span>
        );
      },
    },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "tax_amount", header: "Tax Amount" },
    { accessorKey: "total_amount", header: "Total Amount" },
    {
      accessorKey: "payment_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.payment_status;
        return (
          <Badge
            label={
              status === "paid"
                ? "Paid"
                : status === "pending"
                  ? "Pending"
                  : "Null"
            }
            variant={statusVariant[status]}
          />
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data?.billing_history || []}
        search={false}
        // loading={loading}
        // setTableParams={setTableParams}
        // tableParams={tableParams}
        // pagination={pagination}
        // paginationVisibile={true}
      />
    </div>
  );
};

export default BillingHistory;
