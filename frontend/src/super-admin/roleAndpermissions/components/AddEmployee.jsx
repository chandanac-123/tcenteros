import {
  useCreateEmployeeMutation,
  useDesignationQuery,
} from "@api-queries/super-admin/role-permission/Query";
import CustomeModal from "@common/components/CustomeModal";
import AddDesignation from "@super-admin/roleAndpermissions/components/AddDesignation";
import { Button } from "@pages/components/ui/button";
import { Input } from "@pages/components/ui/input";
import { useFormik } from "formik";
import { Plus } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import CustomeSelect from "@common/components/CustomeSelect";
import CustomDatePicker from "@common/components/CustomeDatepicker";

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
  console.log("data: ", data);
  const { mutateAsync: createEmployee, isPending } =
    useCreateEmployeeMutation();

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
          <div className="flex flex-col gap-2">
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

            {data?.designations?.length > 0 && (
              <div className="flex justify-start items-center gap-2">
                <div>
                  <CustomeSelect
                    label="Designation"
                    name="designation_id"
                    options={data?.designations}
                    value={formik.values.designation_id}
                    onChange={(value) =>
                      formik.setFieldValue("designation_id", value)
                    }
                    error={
                      formik.touched.designation_id &&
                      formik.errors.designation_id
                    }
                    placeholder="Select Designation"
                  />
                </div>

                <div>
                  <Button
                    size="mini"
                    type="button"
                    onClick={() => setDesignationOpen(true)}
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
            )}

            <CustomDatePicker
              disableFuture={true}
              label="Joining Date"
              name="joining_date"
              value={
                formik.values.joining_date
                  ? new Date(formik.values.joining_date)
                  : null
              }
              onChange={(val) => handleDateChange("joining_date", val)}
              error={formik.touched.joining_date && formik.errors.joining_date}
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
