import { useAllTermsandPrivacyQuery } from "@api-queries/center-admin/branding/Query";
import CustomeModal from "@common/components/CustomeModal";
import { Button } from "@pages/components/ui/button";
import { Spinner } from "@pages/components/ui/spinner";

const Preview = ({ open, setOpen }) => {
  const { data, isFetching } = useAllTermsandPrivacyQuery();
  console.log("data: ", data);

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header="Terms & Conditions Preview"
      className="max-w-xl w-full"
    >
      <div className="flex justify-center">
        {isFetching ? (
          <Spinner />
        ) : (
          <div>
            <p className="text-sm whitespace-pre-wrap">
              {data?.terms_and_conditions}
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
