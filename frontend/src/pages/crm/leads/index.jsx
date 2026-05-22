import { DataTable } from "@common/components/DataTable";
import { useState } from "react";

const Leads = ({excelData}) => {
  const [tableParams, setTableParams] = useState({
    page: 1,
  });

  const columns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Phone Number" },
    { accessorKey: "phone_number", header: "Date" },
    { accessorKey: "location", header: "Location" },
  ];

  return (
    <div className="flex flex-col mt-4">
      <DataTable
        title="Products"
        subTitle="Products"
        columns={columns}
        data={excelData}
        search={false}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
    </div>
  );
};

export default Leads;
