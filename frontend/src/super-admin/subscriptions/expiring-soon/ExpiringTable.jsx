import { DataTable } from "@common/components/DataTable";
import { Button } from "@pages/components/ui/button";
import { useState } from "react";
import AddGrace from "./AddGrace";

const ExpiringTable = ({ data, isLoading, tableParams, setTableParams }) => {
  const [graceOpen, setGraceOpen] = useState(false);
  const flattenedCenters = data?.flatMap((day) => day.centers) || [];
  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    { accessorKey: "renewal_date", header: "Renewal Date" },
    { accessorKey: "renewal_amount", header: "Value" },
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
    { accessorKey: "status", header: "Partner" },
    {
      accessorKey: "status",
      header: "Action",
      cell: ({ row }) => (
        <span className="flex  gap-2">
          <Button size="notificationbutton">Send Reminder</Button>
          <Button
            onClick={() => setGraceOpen(true)}
            size="notificationbutton"
            className="bg-plan_purple hover:bg-plan_purple"
          >
            Add Grace
          </Button>
          <AddGrace graceOpen={graceOpen} setGraceOpen={setGraceOpen} />
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={flattenedCenters || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={30}
        loading={isLoading}
        paginationVisibile={true}
        search={false}
      />
    </>
  );
};

export default ExpiringTable;
