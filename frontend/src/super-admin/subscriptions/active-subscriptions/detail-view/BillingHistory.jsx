import { DataTable } from "@common/components/DataTable";
import React, { useState } from "react";

const BillingHistory = () => {
  const columns = [
    { accessorKey: "full_name", header: "Invoice ID" },
    { accessorKey: "designation_name", header: "Period" },
    { accessorKey: "email", header: "Amount" },
    { accessorKey: "email", header: "Tax Amount" },
    { accessorKey: "email", header: "Total Amount" },
    { accessorKey: "mobile", header: "Date" },
    { accessorKey: "joining_date", header: "Status" }
  ];
  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={[]}
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
