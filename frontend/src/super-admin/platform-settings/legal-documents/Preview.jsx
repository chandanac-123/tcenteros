import CustomeModal from "@common/components/CustomeModal";
import { Button } from "@pages/components/ui/button";
import { Spinner } from "@pages/components/ui/spinner";

const Preview = ({ open, setOpen ,data,isFetching}) => {

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header={data?.title}
      className="max-w-xl w-full"
    >
      <div className="flex justify-center">
        {isFetching ? (
          <Spinner />
        ) : (
          <div>
            <p className="text-sm whitespace-pre-wrap">
              {data?.content}
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <Button size="addbutton" type="button" onClick={() => setOpen(false)}>
          Close Preview
        </Button>
      </div>
    </CustomeModal>
  );
};

export default Preview;
