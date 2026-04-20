import {
  useCreateEmployeeMutation,
  useDesignationQuery,
} from "@api-queries/super-admin/role-permission/Query";
import CustomeModal from "@common/components/CustomeModal";
import AddDesignation from "@super-admin/roleAndpermissions/components/AddDesignation";
import { Button } from "@pages/components/ui/button";
import { Input } from "@pages/components/ui/input";
import CustomeSelect from "@common/components/CustomeSelect";
import CustomDatePicker from "@common/components/CustomeDatepicker";
import { format } from "date-fns";
import { useFormik } from "formik";
import { Plus } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";

const employeeValidationSchema = Yup.object().shape({
  full_name: Yup.string().trim().required("Full name is required"),
  email: Yup.string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string().trim().required("Phone number is required"),
  password: Yup.string().required("Password is required"),
  designation_id: Yup.string().required("Designation is required"),
  joining_date: Yup.string().required("Joining date is required"),
});

const AddEmployee = ({ open, setOpen }) => {
  const [designationOpen, setDesignationOpen] = useState(false);
  const { data, isLoading } = useDesignationQuery({ page: 1 });
  const { mutateAsync: createEmployee, isPending } =
    useCreateEmployeeMutation();

  const designationOptions = Array.isArray(data)
    ? data
    : data?.designations || data?.results || data?.data?.results || data?.data || [];

  const initialValues = {
    full_name: "",
    email: "",
    phone: "",
    password: "",
    designation_id: "",
    joining_date: new Date().toISOString().split("T")[0],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: employeeValidationSchema,
    onSubmit: async (values) => {
      try {
        await createEmployee({
          full_name: values.full_name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          password: values.password,
          designation_id: values.designation_id,
          joining_date: values.joining_date,
        });
        formik.resetForm();
        setOpen(false);
      } catch (error) {
        return error;
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setOpen(false);
  };

  const handleDateChange = (field, value) => {
    formik.setFieldValue(field, value ? format(value, "yyyy-MM-dd") : "");
  };

  return (
    <>
      <CustomeModal
        open={open}
        onOpenChange={setOpen}
        header="Add New Employee"
        className="max-w-xl w-full"
      >
        <form
          className="flex flex-col space-y-4"
          onSubmit={formik.handleSubmit}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Full Name"
              name="full_name"
              placeholder="Enter full name"
              value={formik.values.full_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.full_name && formik.errors.full_name}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && formik.errors.email}
            />
            <Input
              label="Phone Number"
              name="phone"
              placeholder="Enter phone number"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && formik.errors.phone}
            />
            <Input
              label="Set Password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && formik.errors.password}
            />

            <div className="md:col-span-2">
              {isLoading ? (
                <Input label="Designation" value="Loading designations..." disabled />
              ) : designationOptions.length > 0 ? (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <CustomeSelect
                      label="Designation"
                      name="designation_id"
                      options={designationOptions}
                      value={formik.values.designation_id}
                      onChange={(value) => {
                        formik.setFieldValue("designation_id", value);
                        formik.setFieldTouched("designation_id", true, false);
                      }}
                      error={
                        formik.touched.designation_id &&
                        formik.errors.designation_id
                      }
                      placeholder="Select designation"
                    />
                  </div>
                  <Button
                    size="mini"
                    type="button"
                    className="mb-[2px]"
                    onClick={() => setDesignationOpen(true)}
                  >
                    <Plus />
                    Add
                  </Button>
                </div>
              ) : (
                <div>
                  <label className="block mb-1 text-sm font-normal text-textblack">
                    Designation
                  </label>
                  <div className="flex items-center justify-between rounded-md border border-dashed border-input bg-muted/20 px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      No designation found. Create one to continue.
                    </span>
                    <Button
                      size="mini"
                      type="button"
                      onClick={() => setDesignationOpen(true)}
                    >
                      <Plus />
                      Add Designation
                    </Button>
                  </div>
                  {formik.touched.designation_id && formik.errors.designation_id ? (
                    <div className="text-xs text-red_text mt-1">
                      {formik.errors.designation_id}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <CustomDatePicker
                disableFuture={true}
                label="Joining Date"
                name="joining_date"
                value={
                  formik.values.joining_date
                    ? new Date(formik.values.joining_date)
                    : null
                }
                onChange={(value) => handleDateChange("joining_date", value)}
                error={formik.touched.joining_date && formik.errors.joining_date}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end ">
            <Button
              size="addbutton"
              variant="outline_secondary"
              type="button"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button size="addbutton" type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </CustomeModal>

      <AddDesignation
        designationOpen={designationOpen}
        setDesignationOpen={setDesignationOpen}
      />
    </>
  );
};

export default AddEmployee;
