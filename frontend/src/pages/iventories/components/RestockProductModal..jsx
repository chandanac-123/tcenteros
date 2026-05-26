import CustomeModal from "@common/components/CustomeModal";
import { Input } from "@pages/components/ui/input";
import { Button } from "@pages/components/ui/button";
import {
  useProductByIdQuery,
  useUpdateProductMutation,
} from "@api-queries/center-admin/inventory/Query";
import { useFormik } from "formik";
import CustomeSelect from "@common/components/CustomeSelect";

import CustomDatePicker from "@common/components/CustomeDatepicker";
import { format } from "date-fns";

const unitTypes = [
  { id: "Kilogram", name: "Kilogram" },
  { id: "Gram", name: "Gram " },
  { id: "Liter", name: "Liter " },
  { id: "Milliliter", name: "Milliliter" },
  { id: "Piece", name: "Piece" },
  { id: "Pack", name: "Pack" },
  { id: "box", name: "Box" },
  { id: "unit", name: "Unit" },
];

const RestockProductModal = ({ open, setOpen, restockId }) => {
  const { data: productData } = useProductByIdQuery(restockId)
  console.log('productData: ', productData);
  const { mutateAsync: updateProduct, isLoading } = useUpdateProductMutation();

  const initialValues = {
    name: productData?.name || "",
    sku_category_id: productData?.sku_category_id || "",
    base_price: productData?.base_price || "",
    selling_price: productData?.selling_price || "",
    unit_of_measure: productData?.unit_of_measure || "",
    initial_stock: productData?.stock || "",
    supplier_name: "",
    invoice_number: "",
    invoice_date: "",
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await updateProduct({ id: restockId, data: values });
        setOpen(false);
        formik.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
  });

  const handleDateChange = (field, val) => {
    formik.setFieldValue(field, val ? format(val, "yyyy-MM-dd") : "");
  };
  console.log('formik: ', formik);

  return (
    <CustomeModal open={open} onOpenChange={setOpen} header="Restock Product">
      <form
        onSubmit={formik.handleSubmit}
        className="w-full max-w-2xl space-y-2 "
      >
        <div className='flex gap-2 justify-between '>
          <div className='flex flex-col'>
            <span className='text-sm'>Product Name</span>
            <span className='flex text-textgrey '>
              {productData?.name}
            </span>
          </div>
          <div className='flex flex-col'>
            <span className='text-sm'>Category</span>
            <span className='flex text-textgrey '>
              {productData?.sku_category_name}
            </span>
          </div>
          <div className='flex flex-col'>
            <span className='text-sm'>Available Quantity</span>
            <span className='flex text-textgrey '>{productData?.stock}</span>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <CustomeSelect
            label="Unit Type"
            name="unit_of_measure"
            placeholder="Select Unit"
            options={unitTypes}
            value={formik.values.unit_of_measure}
            onChange={(value) => formik.setFieldValue("unit_of_measure", value)}
          />
          <Input
            label="Base Price"
            placeholder="Add Base Price"
            name="base_price"
            type="number"
            value={formik.values.base_price}
            onChange={formik.handleChange}
            error={formik.touched.base_price && formik.errors.base_price}
          />

          <div>
            <Input
              label="Selling Price"
              placeholder="Add Selling Price"
              name="selling_price"
              type="number"
              value={formik.values.selling_price}
              onChange={formik.handleChange}
              error={
                formik.touched.selling_price && formik.errors.selling_price
              }
            />
          </div>

          <Input
            label="Supplier Name"
            placeholder="Enter Supplier Name"
            name="supplier_name"
            value={formik.values.supplier_name}
            onChange={formik.handleChange}
          />
          <Input
            label="Invoice Number"
            placeholder="Enter Invoice Number"
            name="invoice_number"
            value={formik.values.invoice_number}
            onChange={formik.handleChange}
          />

          <CustomDatePicker
            disableFuture={true}
            label="Invoice Date"
            placeholder="Add Invoice Date"
            name="invoice_date"
            value={
              formik.values.invoice_date
                ? new Date(formik.values.invoice_date)
                : null
            }
            onChange={(val) => handleDateChange("invoice_date", val)}
          />
          <Input
            label="Add Quantity"
            type="number"
            placeholder="Add Quantity"
            name="initial_stock"
            value={formik.values.initial_stock}
            onChange={formik.handleChange}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button size="addbutton" type="submit">
            Restock Product
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default RestockProductModal;
