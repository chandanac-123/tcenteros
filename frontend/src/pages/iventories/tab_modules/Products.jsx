import React, { useState } from "react";
import { DataTable } from "@common/components/DataTable";
import {
  useAllProductsQuery,
} from "@api-queries/center-admin/inventory/Query";
import { Button } from "@pages/components/ui/button";
import AddProductModal from "../components/AddProductModal";
import RestockProductModal from "../components/RestockProductModal.";
import { Plus } from "lucide-react";

const Products = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
  });
  const { data, isFetching } = useAllProductsQuery(tableParams);
  const [restockOpen, setRestockOpen] = useState(false);
  const [restockId, setRestockId] = useState(null);
  const [open, setOpen] = useState(false);

  const columns = [
    { accessorKey: "name", header: "Product Name" },
    { accessorKey: "sku_code", header: "SKU Code" },
    { accessorKey: "stock", header: "Current Stock" },
    { accessorKey: "base_price", header: "Base Price" },
    { accessorKey: "selling_price", header: "Selling Price" },
    { accessorKey: "reorder_level", header: "Reorder Level" },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size='notificationbutton'
            variant='button_filled'
            type='button'
            onClick={() => {
              setRestockId(row.original.product_id);
              setRestockOpen(true);
            }}
          >
            <Plus strokeWidth={2.75}/>
            Add more
          </Button>
        </div>
      ),
    },
  ];


  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Products List</h1>
        <div className="flex gap-2">
          <Button size="addbutton" type="submit" onClick={() => setOpen(true)}>
              <Plus strokeWidth={2.75}/> Add Product
          </Button>
          <AddProductModal open={open} setOpen={setOpen} />
        </div>
      </div>
      <div className="">
        <DataTable
          columns={columns}
          data={data?.products || []}
          setTableParams={setTableParams}
          tableParams={tableParams}
          pagination={data?.total}
          loading={isFetching}
          paginationVisibile={true}
          search={false}
        />
      </div>
      <RestockProductModal open={restockOpen} setOpen={setRestockOpen} restockId={restockId} />
    </div>
  );
};

export default Products;
