import CustomeModal from "@common/components/CustomeModal";
import { Input } from "@pages/components/ui/input";
import { Button } from "@pages/components/ui/button";
import {
  useAddStockMutation,
  useProductDropdownQuery,
} from "@api-queries/center-admin/inventory/Query";
import { useFormik } from "formik";
import CustomDatePicker from "@common/components/CustomeDatepicker";
import { format } from "date-fns";
import { addStockValidationSchema } from "@utils/validations";

const RestockProductModal = ({ open, setOpen, product }) => {
  const { data: productDropdownData } = useProductDropdownQuery()
  const { mutateAsync: addStock, isLoading } = useAddStockMutation();
  const initialValues = {
    unit_cost: "",
    selling_price: "",
    quantity: "",
    supplier_name: "",
    invoice_number: "",
    invoice_date: null,
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: addStockValidationSchema,
    onSubmit: async (values) => {
      try {
        await addStock({
          id: product?.product_id,
          data: values,
        });
        setOpen(false);
        formik.resetForm();
      } catch (error) {
      }
    },
  });

  const handleDateChange = (field, val) => {
    formik.setFieldValue(field, val ? format(val, "yyyy-MM-dd") : "");
  };

  return (
    <CustomeModal open={open} onOpenChange={setOpen} header="Add Stock">
      <form
        onSubmit={formik.handleSubmit}
        className="w-full max-w-2xl space-y-2 "
      >
        <div className="font-medium text-md text-gray-600 capitalize">
          Product: {product?.name}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Base Price"
            placeholder="Add Base Price"
            name="unit_cost"
            type="number"
            value={formik.values.unit_cost}
            onChange={formik.handleChange}
            error={formik.touched.unit_cost && formik.errors.unit_cost}
          />
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
          <Input
            label="Add Quantity"
            type="number"
            placeholder="Add Quantity"
            name="quantity"
            value={formik.values.quantity}
            onChange={formik.handleChange}
            error={formik.touched.quantity && formik.errors.quantity}
          />
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
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button size="addbutton" type="submit">
            Add Stock
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default RestockProductModal;
