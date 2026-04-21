import { Button } from "@pages/components/ui/button";
import { Textarea } from "@pages/components/ui/textarea";
import { Eye, FileText } from "lucide-react";
import { useState } from "react";
import Preview from "./Preview";
import { useCreateGlobalTermsAndPrivacyMutation } from "@api-queries/super-admin/platform-settings/Query";
import { useAllTermsandPrivacyQuery } from "@api-queries/center-admin/branding/Query";

const LegalDocuments = () => {
  const [open, setOpen] = useState(false);
  const { data, isFetching } = useAllTermsandPrivacyQuery();
  console.log("data: ", data);
  const { mutateAsync: createGlobalTermsAndPrivacy, isLoading: isCreating } =
    useCreateGlobalTermsAndPrivacyMutation();

  return (
    <div className="flex flex-col p-4 rounded-lg space-y-4 mt-4 shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
      <form>
        <div className="flex items-center justify-between p-4">
          <div className="flex  gap-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <FileText size={16} className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-2">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Terms & Conditions
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                Last updated: 2026-04-18
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              size="addbutton"
              variant="outline_secondary"
              type="button"
              onClick={() => setOpen(true)}
            >
              <Eye />
              Show Preview
            </Button>
            <Preview
              open={open}
              setOpen={setOpen}
              data={data}
              isFetching={isFetching}
            />
          </div>
        </div>

        <div>
          <Textarea label="Content" rows={10} value={data?.content || ""} />
        </div>
        <div className="flex justify-end mt-4">
          <Button size="addbutton" type="submit">
            Save Terms & Condition
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LegalDocuments;
