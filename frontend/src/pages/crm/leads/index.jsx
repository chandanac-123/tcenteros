import { useLeadsQuery } from "@api-queries/center-admin/crm/Query";
import { DataTable } from "@common/components/DataTable";
import { formatDate } from "@utils/helper";
import { useState } from "react";

const Leads = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
  });
  const { data } = useLeadsQuery(tableParams);

  const columns = [
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <span className="flex">{formatDate(row?.original?.created_at)}</span>
      ),
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone_number", header: "Phone Number" },
    { accessorKey: "location", header: "Location" },
  ];

  return (
    <div className="flex flex-col mt-4">
      <DataTable
        columns={columns}
        data={data?.data}
        search={false}
        pagination={data?.total_records}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
    </div>
  );
};

export default Leads;
