import CustomeModal from "@common/components/CustomeModal";
import { Input } from "@pages/components/ui/input";
import { Button } from "@pages/components/ui/button";
import {
  useAddStockMutation,
  useProductDropdownQuery,
} from "@api-queries/center-admin/inventory/Query";
import { useFormik } from "formik";
import CustomeSelect from "@common/components/CustomeSelect";
import CustomDatePicker from "@common/components/CustomeDatepicker";
import { format } from "date-fns";
import { addStockValidationSchema } from "@utils/validations";


const RestockProductModal = ({ open, setOpen }) => {
  const { data: productDropdownData } = useProductDropdownQuery()
  const { mutateAsync: addStock, isLoading } = useAddStockMutation();
  const initialValues = {
    product_id: "",
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
        const { product_id, ...payload } = values;
        await addStock({
          id: product_id,
          data: payload,
        });
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

  return (
    <CustomeModal open={open} onOpenChange={setOpen} header="Add Stock">
      <form
        onSubmit={formik.handleSubmit}
        className="w-full max-w-2xl space-y-2 "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <CustomeSelect
            label='Product Name'
            name='product_id'
            placeholder='Select Product'
            options={productDropdownData?.products || []}
            value={formik.values.product_id}
            onChange={value => formik.setFieldValue('product_id', value)}
            error={formik.touched.product_id && formik.errors.product_id}
          />
          <Input
            label="Base Price"
            placeholder="Add Base Price"
            name="unit_cost"
            type="number"
            value={formik.values.unit_cost}
            onChange={formik.handleChange}
            error={formik.touched.unit_cost && formik.errors.unit_cost}
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
            name="quantity"
            value={formik.values.quantity}
            onChange={formik.handleChange}
            error={formik.touched.quantity && formik.errors.quantity}
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
