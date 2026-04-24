import {
  useDeleteEmployeeMutation,
  useEmployeeQuery,
} from "@api-queries/super-admin/role-permission/Query";
import { DataTable } from "@common/components/DataTable";
import React, { useState } from "react";
import deleteicon from "@assets/form-icons/delete.svg";
import DeleteModal from "@common/components/CustomeDelete";

const EmployeeTab = () => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [tableParams, setTableParams] = useState({
    page: 1,
  });
  const { data, isPending } = useEmployeeQuery(tableParams);
  const { mutateAsync: deleteEmployee } = useDeleteEmployeeMutation();

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);
      setDeleteOpen(false);
      setDeleteId(null);
    } catch (err) {
      return err;
    }
  };

  const columns = [
    { accessorKey: "full_name", header: "Employee Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone Number" },
    { accessorKey: "designation_name", header: "Designation" },
    { accessorKey: "joining_date", header: "Joining Date" },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <div className="flex ">
            <button
              type="button"
              className="rounded-md p-1 transition hover:bg-red-50"
              onClick={() => {
                setDeleteId(row.original.id);
                setDeleteOpen(true);
              }}
            >
              <img src={deleteicon} alt="delete" loading="lazy" className="w-6 h-6" />
            </button>
          </div>
        );
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
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header="Delete Employee"
        description="Are you sure you want to delete this employee?"
        onConfirm={() => handleDelete(deleteId)}
      />
    </div>
  );
};

export default EmployeeTab;
