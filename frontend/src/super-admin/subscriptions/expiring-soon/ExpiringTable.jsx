import { DataTable } from "@common/components/DataTable";
import { Button } from "@pages/components/ui/button";
import { useState } from "react";
import AddGrace from "./AddGrace";

const ExpiringTable = ({ data, isLoading, tableParams, setTableParams }) => {

  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    { accessorKey: "contact_person_name", header: "Center Person" },
    { accessorKey: "center_email", header: "Center Email" },
    {
      accessorKey: "subscription_expired_on",
      header: "Expired On",
      cell: ({ row }) => {
        const date = row.original.expired_on;

        const formattedDate = date
          ? new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          : "_ _";

        return <span>{formattedDate}</span>;
      },
    },
    {
      accessorKey: "days_expired",
      header: "Days Expired",
      cell: ({ row }) => {
        const date = row.original.days_expired;

        return(
          <div>
            <p  className=" bg-rose-100 text-red w-fit px-4 rounded-md border border-red font-semibold">{date}</p>
          </div>
        )
      }
    },
    {
      accessorKey: "last_invoice",
      header: "Subscription Type",
      cell: ({ row }) => {
        const duration = row.original?.subscription_duration;

        let colorClass = "";

        if (duration === "monthly") {
          colorClass = "bg-plan_bg_purple border-none  text-plan_purple  rounded-lg text-xs font-medium justify-center w-32 px-3 py-1";
        } else if (duration === "yearly") {
          colorClass = "bg-badge_blue_bg border-none  text-badge_blue rounded-lg  text-xs font-medium justify-center w-32 px-3 py-1";
        } else {
          colorClass = "";
        }

        return (
          <span
            className={`px-2 py-1 text-xs border rounded-md capitalize ${colorClass}`}
          >
            {duration || "_ _"}
          </span>
        );
      }
    }
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={data?.total}
        loading={isLoading}
        paginationVisibile={true}
        search={false}
      />
    </>
  );
};

export default ExpiringTable;
