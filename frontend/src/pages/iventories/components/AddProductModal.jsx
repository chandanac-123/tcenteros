import CustomeModal from "@common/components/CustomeModal";
import { Input } from "@pages/components/ui/input";
import { Button } from "@pages/components/ui/button";
import {
  useCreateProductMutation,
  useAllSKUsQuery,
} from "@api-queries/center-admin/inventory/Query";
import { useFormik } from "formik";
import { productValidationSchema } from "@utils/validations";
import CustomeSelect from "@common/components/CustomeSelect";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AddProductCategory from "@pages/settings/components/AddProductCategory";
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

const AddProductModal = ({ open, setOpen }) => {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const { mutateAsync: createProduct, isLoading } = useCreateProductMutation();
  const { data: skus } = useAllSKUsQuery();

  const isCategoryEmpty = !skus || skus.length == 0;
  const initialValues = {
    name: "",
    sku_category_id: "",
    base_price: "",
    selling_price: "",
    unit_of_measure: "",
    initial_stock: null,
    supplier_name: "",
    invoice_number: null,
    invoice_date: null,
  };

  useEffect(() => {
    if (skus?.length == 0) {
      setCategoryOpen(true);
    }
  }, [open]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: productValidationSchema,
    onSubmit: async (values) => {
      try {
        await createProduct(values);
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
    <CustomeModal open={open} onOpenChange={setOpen} header="Add Product">
      <form
        onSubmit={formik.handleSubmit}
        className="w-full max-w-2xl space-y-2 "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <Input
            label="Product Name"
            placeholder="Enter Product Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && formik.errors.name}
          />

          <div className="flex items-center gap-2">
            <div className="flex-1">
              {isCategoryEmpty ? (
                <p className="flex text-red_text text-sm items-baseline ">
                  Create a category first.
                </p>
              ) : (
                <CustomeSelect
                  label="Category"
                  placeholder="Select Category"
                  name="sku_category_id"
                  options={skus || []}
                  value={formik.values.sku_category_id}
                  onChange={(value) =>
                    formik.setFieldValue("sku_category_id", value)
                  }
                />
              )}
            </div>
            <button
              type="button"
              className="h-9 w-9 flex items-center justify-center rounded-md border border-input mt-6"
              onClick={() => setCategoryOpen(true)}
            >
              <Plus className="h-4 w-4 text-primary" />
            </button>
            <AddProductCategory
              open={categoryOpen}
              onOpenChange={setCategoryOpen}
            />
          </div>

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
            label="Quantity"
            type="number"
            placeholder="Add Quantity"
            name="initial_stock"
            value={formik.values.initial_stock}
            onChange={formik.handleChange}
            error={
              formik.touched.initial_stock && formik.errors.initial_stock
            }
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button size="addbutton" type="submit">
            Add Product
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default AddProductModal;
