import CustomeModal from "@common/components/CustomeModal";
import { Button } from "@pages/components/ui/button";

const Preview = ({ open, setOpen }) => {
  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header="Terms & Conditions Preview"
      className="max-w-xl w-full"
    >
      <div className="flex justify-end mt-4">
        <Button size="addbutton" type="button" onClick={() => setOpen(false)}>
          Close Preview
        </Button>
      </div>
    </CustomeModal>
  );
};

export default Preview;
