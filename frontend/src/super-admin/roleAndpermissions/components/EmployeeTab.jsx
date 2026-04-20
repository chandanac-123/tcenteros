import { useEmployeeQuery } from "@api-queries/super-admin/role-permission/Query";
import { DataTable } from "@common/components/DataTable";
import React, { useState } from "react";
import deleteicon from "@assets/form-icons/delete.svg";

const EmployeeTab = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
  });
  const { data, isPending } = useEmployeeQuery(tableParams);
  const columns = [
    { accessorKey: "full_name", header: "Employee Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone Number" },
    { accessorKey: "designation_name", header: "Designation" },
    { accessorKey: "joining_date", header: "Joining Date" },
    {
      accessorKey: "pending",
      header: "Action",
      cell: ({ row }) => {
        <div>
          <button>
            <img src={deleteicon} alt="delete" className="w-6 h-6" />
          </button>
        </div>;
      },
    },
  ];

  return (
    <div className="px-4">
      <div className="shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-md p-4">
        <DataTable
          columns={columns}
          data={data?.employees || []}
          loading={isPending}
          tableParams={tableParams}
          setTableParams={setTableParams}
          pagination={data?.total}
          paginationVisibile={true}
          search={false}
        />
      </div>
    </div>
  );
};

export default EmployeeTab;
