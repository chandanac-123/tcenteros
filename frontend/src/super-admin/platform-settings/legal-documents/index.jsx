import { Button } from "@pages/components/ui/button";
import { Textarea } from "@pages/components/ui/textarea";
import { Eye, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Preview from "./Preview";
import { useCreateGlobalTermsAndPrivacyMutation } from "@api-queries/super-admin/platform-settings/Query";
import { useAllTermsandPrivacyQuery } from "@api-queries/center-admin/branding/Query";

const LegalDocuments = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const { data, isFetching } = useAllTermsandPrivacyQuery();
  const { mutateAsync: createGlobalTermsAndPrivacy, isLoading: isCreating } =
    useCreateGlobalTermsAndPrivacyMutation();

  useEffect(() => {
    setContent(data?.content || "");
  }, [data?.content]);

  const lastUpdatedLabel = useMemo(() => {
    const rawDate = data?.updated_at || data?.modified_at || data?.created_at;
    if (!rawDate) {
      return "Not updated yet";
    }
    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return rawDate;
    }
    return parsedDate.toLocaleDateString("en-CA");
  }, [data?.created_at, data?.modified_at, data?.updated_at]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createGlobalTermsAndPrivacy({
        title: data?.title || "Terms & Conditions",
        content,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col p-3 sm:p-4 rounded-lg space-y-4 mt-4 shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-2 sm:p-4">
          <div className="flex gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)] shrink-0">
              <FileText size={16} className="text-onboard_primary" />
            </div>

            <div className="flex flex-col justify-center gap-1 sm:gap-2">
              <p className="text-base sm:text-[18px] font-semibold text-[#3A3A3A]">
                Terms & Conditions
              </p>

              <p className="text-xs sm:text-[14px] font-medium text-[#393636]">
                Last updated: {lastUpdatedLabel}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
            <Button
              size="addbutton"
              variant="outline_secondary"
              type="button"
              onClick={() => setOpen(true)}
              className="w-full sm:w-auto justify-center"
            >
              <Eye className="h-4 w-4" />
              Show Preview
            </Button>

            <Preview
              open={open}
              setOpen={setOpen}
              data={{
                ...data,
                title: data?.title || "Terms & Conditions",
                content,
              }}
              isFetching={isFetching}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <Textarea
            label="Content"
            rows={10}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={isFetching || isCreating}
            className="w-full"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-stretch sm:justify-end mt-4">
          <Button
            size="addbutton"
            type="submit"
            disabled={isCreating}
            className="w-full sm:w-auto justify-center"
          >
            Save Terms & Condition
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LegalDocuments;
