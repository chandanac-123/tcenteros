import { DataTable } from "@common/components/DataTable";
import { useState } from "react";

const Leads = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 3,
    search: "",
  });

  // Dummy data for DataTable
  const data = [
    {
      id: 1,
      full_name: "John Doe",
      email: "john.doe@example.com",
      mobile: "9876543210",
      status: "active",
      date: "2024-06-10",
    },
    {
      id: 2,
      full_name: "Jane Smith",
      email: "jane.smith@example.com",
      mobile: "9123456780",
      status: "inactive",
      date: "2024-06-10",
    },
    {
      id: 3,
      full_name: "Alice Johnson",
      email: "alice.johnson@example.com",
      mobile: "9988776655",
      status: "pending",
      date: "",
    },
    {
      id: 3,
      full_name: "Alice Johnson",
      email: "alice.johnson@example.com",
      mobile: "9988776655",
      status: "fullfilled",
      date: "2024-06-10",
    },
    {
      id: 3,
      full_name: "Alice Johnson",
      email: "alice.johnson@example.com",
      mobile: "9988776655",
      status: "followwup",
      date: "2024-06-10",
    },
  ];

  const columns = [
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "mobile", header: "Phone Number" },
    { accessorKey: "mobile", header: "Date" },
    { accessorKey: "mobile", header: "Location" },
  ];

  return (
    <div className="flex flex-col mt-4">
      <DataTable
        title="Products"
        subTitle="Products"
        columns={columns}
        data={data}
        search={false}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
    </div>
  );
};

export default Leads;
