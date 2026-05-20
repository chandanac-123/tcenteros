import { DataTable } from "@common/components/DataTable";
import { useAllStockTransactionsQuery } from "@api-queries/center-admin/inventory/Query";
import { useState } from "react";

const Stock_Activity = () => {
  const [tableParams, setTableParams] = useState({ page: 1 });
  const { data, isFetching } = useAllStockTransactionsQuery(tableParams);

  const columns = [
    { accessorKey: "supplier_name", header: "Supplier Name" },
    { accessorKey: "product_name", header: "Product" },
    { accessorKey: "sku_code", header: "SKU Code" },
    { accessorKey: "invoice_number", header: "Invoice Number" },
    { accessorKey: "invoice_date", header: "Date" },
    {
      accessorKey: "transaction_type",
      header: "Transaction Type",
      cell: ({ row }) => {
        const value = row.getValue("transaction_type");
        const status = value?.toUpperCase();
        const styles = {
          IN: "bg-[#DEF4E6] text-[#34C759]",
          OUT: "bg-[#FFE6E7] text-[#A30F0F]",
          RETURN: "bg-[#E6F0FF] text-[#1D4ED8]",
          ADJUSTMENT: "bg-[#FFF4E6] text-[#A37F0F]",
        };
        return (
          <span
            className={`inline-flex justify-center items-center min-w-[90px] px-3 py-1 rounded-[15px] text-[12px] font-medium capitalize ${
              styles[status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {value}
          </span>
        );
      },
    },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "unit_cost", header: "Unit Cost" },
    { accessorKey: "subtotal", header: "Subtotal" },
    { accessorKey: "balance_after", header: "Balance After" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Stock Activity List</h1>
      <div className="">
        <DataTable
          columns={columns}
          data={data?.transactions}
          pagination={data?.total}
          loading={isFetching}
          paginationVisibile={true}
          search={false}
          tableParams={tableParams}
          setTableParams={setTableParams}
        />
      </div>
    </div>
  );
};

export default Stock_Activity;
