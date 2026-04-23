import { DataTable } from "@common/components/DataTable";
import { Button } from "@pages/components/ui/button";
import React from "react";

const EarningPayoutTable = () => {
  const columns = [
    {
      accessorKey: "id",
      header: "TR ID",
    },
    {
      accessorKey: "leadName",
      header: "Lead Name",
    },
    {
      accessorKey: "contact",
      header: "Contact",
    },
    {
      accessorKey: "city",
      header: "Transaction Date",
    },
    {
      accessorKey: "source",
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
  const leadsData = [
    {
      id: 1,
      leadName: "John Mathew",
      contact: "+91 9876543210",
      city: "Kochi",
      source: "Website",
      status: "New",
    },
    {
      id: 2,
      leadName: "Aisha Rahman",
      contact: "+91 9123456780",
      city: "Calicut",
      source: "Facebook",
      status: "Contacted",
    },
    {
      id: 3,
      leadName: "Arun Kumar",
      contact: "+91 9988776655",
      city: "Trivandrum",
      source: "Referral",
      status: "Demo",
    },
    {
      id: 4,
      leadName: "Neha Sharma",
      contact: "+91 9012345678",
      city: "Bangalore",
      source: "Instagram",
      status: "New",
    },
    {
      id: 5,
      leadName: "Rahul Nair",
      contact: "+91 9090909090",
      city: "Kochi",
      source: "Website",
      status: "Lost",
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={leadsData}
        loading={false}
        // tableParams={tableParams}
        // setTableParams={setTableParams}
        pagination={11}
        paginationVisibile={true}
        search={true}
      />
    </div>
  );
};

export default EarningPayoutTable;
