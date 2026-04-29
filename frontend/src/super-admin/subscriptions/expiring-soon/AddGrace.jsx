import React from "react";
import CustomeModal from "@common/components/CustomeModal";
import { Button } from "@pages/components/ui/button";
import { useCreateSalaryMutation } from "@api-queries/center-admin/employee-salary/Query";
import { useFormik } from "formik";
import { Input } from "@pages/components/ui/input";
import { Textarea } from "@pages/components/ui/textarea";

const AddGrace = ({ graceOpen, setGraceOpen }) => {
  const { mutateAsync: createEmployeeSalary, isPending } =
    useCreateSalaryMutation();

  const initialValues = {
    grace_days: "",
    reason: "",
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await createEmployeeSalary(values);
        formik.resetForm();
        setGraceOpen(false);
      } catch (error) {
        console.error(error);
      }
    },
  });
  return (
    <CustomeModal
      open={graceOpen}
      onOpenChange={setGraceOpen}
      header="Add Grace"
    >
      <form className="space-y-4" onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1  gap-4">
          <Input
            label="Grace Days"
            name="grace_days"
            value={formik.values.grace_days}
            onChange={formik.handleChange}
          />
          <Textarea
            label="Reason"
            name="reason"
            value={formik.values.reason}
            onChange={formik.handleChange}
          />
        </div>
        <div className="flex justify-end">
          <Button size="addbutton" type="submit">
            Add Grace
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default AddGrace;
