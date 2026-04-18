import CustomeModal from "@common/components/CustomeModal";
import { Button } from "@pages/components/ui/button";
import { Input } from "@pages/components/ui/input";

const AddDesignation = ({ open, setOpen }) => {
  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header="Add New Designation"
      className="max-w-xl w-full"
    >
      <form className="flex flex-col space-y-4">
        <div className="flex flex-col gap-2">
          <Input
            label="Name"
            name="salary"
            // value={formik.values.salary}
            // onChange={formik.handleChange}
            // error={formik.touched.salary && formik.errors.salary}
          />
          <Input
            label="Email"
            name="salary"
            // value={formik.values.salary}
            // onChange={formik.handleChange}
            // error={formik.touched.salary && formik.errors.salary}
          />{" "}
          <Input
            label="Phone number"
            name="salary"
            // value={formik.values.salary}
            // onChange={formik.handleChange}
            // error={formik.touched.salary && formik.errors.salary}
          />{" "}
          <Input
            label="Designation"
            name="salary"
            // value={formik.values.salary}
            // onChange={formik.handleChange}
            // error={formik.touched.salary && formik.errors.salary}
          />
          <Input
            label="Joing Date"
            name="salary"
            // value={formik.values.salary}
            // onChange={formik.handleChange}
            // error={formik.touched.salary && formik.errors.salary}
          />
          <Input
            label="Set Password"
            name="salary"
            // value={formik.values.salary}
            // onChange={formik.handleChange}
            // error={formik.touched.salary && formik.errors.salary}
          />
        </div>
        <div className="flex gap-2 justify-end ">
          <Button size='addbutton' variant="outline_secondary" type="button">
            Cancel
          </Button>
          <Button size="addbutton">Submit</Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default AddDesignation;
