import { DataTable } from "@common/components/DataTable";

const Table = ({ data, isLoading, tableParams, setTableParams }) => {

  const columns = [
    { accessorKey: "center_name", header: "Center Name" },
    { accessorKey: "contact_person", header: "Contact Person" },
    { accessorKey: "center_email", header: "Center Email" },
    { accessorKey: "center_phone", header: "Center Phone" },
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

export default Table;
