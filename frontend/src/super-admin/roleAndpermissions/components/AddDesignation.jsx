import { useCreateDesignationMutation } from "@api-queries/super-admin/role-permission/Query";
import CustomeModal from "@common/components/CustomeModal";
import { Button } from "@pages/components/ui/button";
import { Input } from "@pages/components/ui/input";
import { useFormik } from "formik";
import * as Yup from "yup";

const designationValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required("Designation name is required"),
});

const AddDesignation = ({ designationOpen, setDesignationOpen, open, setOpen }) => {
  const { mutateAsync: createDesignation, isPending } =
    useCreateDesignationMutation();

  const modalOpen = designationOpen ?? open;
  const setModalOpen = setDesignationOpen ?? setOpen;

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: designationValidationSchema,
    onSubmit: async (values) => {
      try {
        await createDesignation({ name: values.name.trim() });
        formik.resetForm();
        setModalOpen(false);
      } catch (error) {
        return error;
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setModalOpen(false);
  };

  return (
    <CustomeModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      header="Add New Designation"
      className="max-w-xl w-full"
    >
      <form className="flex flex-col space-y-4" onSubmit={formik.handleSubmit}>
        <div className="flex flex-col gap-2">
          <Input
            label="Name"
            name="name"
            placeholder="Enter designation name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && formik.errors.name}
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
  );
};

export default AddDesignation;
