import React from "react";
import HeaderProgress from "./components/HaederProgress";
import PartnerLayout from "./components/Layout";
import { Textarea } from "@pages/components/ui/textarea";
import { Checkbox } from "@pages/components/ui/checkbox";
import { Button } from "@pages/components/ui/button";
import { MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateOnboardCenterMutation } from "@api-queries/partner/on-boarding/Query";
import { useFormik } from "formik";
import { useOnboardingStore } from "@store/onboardingStore";
import { showError } from "@utils/toast";

const Agreement = () => {
  const navigate = useNavigate();
  const { mutateAsync: createOnboardCenter, isPending } =
    useCreateOnboardCenterMutation();
  const partnerOnboardingDraft = useOnboardingStore(
    (state) => state.partnerOnboardingDraft,
  );
  const setPartnerOnboardingDraft = useOnboardingStore(
    (state) => state.setPartnerOnboardingDraft,
  );
  const setOnboardId = useOnboardingStore((state) => state.setOnboardId);

  const formik = useFormik({
    initialValues: {
      terms_accepted: Boolean(partnerOnboardingDraft?.terms_accepted),
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!values.terms_accepted) {
        showError("Please accept the reseller terms to continue");
        return;
      }
      const payload = {
        ...partnerOnboardingDraft,
        terms_accepted: values.terms_accepted,
      };
      try {
        setPartnerOnboardingDraft({ terms_accepted: values.terms_accepted });
        const response = await createOnboardCenter(payload);

        if (response?.id) {
          setOnboardId(response.id);
        }

        navigate("/payment");
      } catch (error) {
        console.log("error: ", error);
      }
    },
  });

  return (
    <PartnerLayout>
      <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-4">
        <HeaderProgress currentStep={2} />
        <form className=" px-4 gap-4 flex flex-col" onSubmit={formik.handleSubmit}>
          <span className="flex text-md font-semibold">
            Resseller Esstential
          </span>
          <Textarea
            label=""
            rows={8}
            value="By continuing, you confirm that you understand and accept the reseller terms, commission rules, lead handling policy, and code of conduct."
            readOnly
          />

          <div className="flex items-center gap-4">
            <Checkbox
              checked={formik.values.terms_accepted}
              onCheckedChange={(value) =>
                formik.setFieldValue("terms_accepted", Boolean(value))
              }
            />
            <label className="text-xs font-semibold">
              I agree to the Reseller Terms & Policies and understand the
              commission structure, lead policy, and code of conduct.
            </label>
          </div>
          <Button
            size="addbutton"
            type="submit"
            disabled={isPending}
            className="w-full justify-center"
          >
            submit <MoveRight />
          </Button>
        </form>
      </div>
    </PartnerLayout>
  );
};

export default Agreement;
