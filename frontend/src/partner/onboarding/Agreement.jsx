import React from "react";
import HeaderProgress from "./components/HaederProgress";
import PartnerLayout from "./components/Layout";
import { Checkbox } from "@pages/components/ui/checkbox";
import { Button } from "@pages/components/ui/button";
import { MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateOnboardCenterMutation } from "@api-queries/partner/on-boarding/Query";
import { useFormik } from "formik";
import { useOnboardingStore } from "@store/onboardingStore";
import { partnerAgreementValidationSchema } from "@utils/validations";

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
    validationSchema: partnerAgreementValidationSchema,
    onSubmit: async (values) => {
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
        <form
          className=" px-4 gap-4 flex flex-col"
          onSubmit={formik.handleSubmit}
        >
          <span className="flex text-md font-semibold">
            Resseller Esstential
          </span>
          <span className="flex border rounded-md p-4 text-sm font-medium h-44 overflow-auto">
            • 15% commission on new sales <br />
            • 3% commission on renewals <br />
            • Commission calculated automatically on payment success
            <br />
            <br />
            Lead Policy <br />
            • Platform provides qualified leads based on your district <br />
            • You can also generate and manage your own leads <br />
            • Response SLA: 2 hours for platform-assigned leads <br /> • Lead
            expiry: 48 hours without status update <br />
            • Leads may be auto-reassigned if no response <br />
            <br /> Payout Cycle <br />
            • Weekly or monthly payout cycles <br />• Commissions tracked in
            real-time in your dashboard <br />• Minimum payout threshold: ₹1,000{" "}
            <br /> <br /> Code of Conduct <br />
            • Represent products accurately and professionally <br />• Maintain
            ethical sales practices <br /> • Respond to assigned leads promptly
            <br />• No misrepresentation of pricing or features Refund &
            Cancellation <br /> • Onboarding fee of ₹2,500 is non-refundable{" "}
            <br />• Reseller account can be deactivated after 60 days of
            inactivity <br />• You can reactivate your account anytime
          </span>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formik.values.terms_accepted}
                onCheckedChange={(value) =>
                  formik.setFieldValue("terms_accepted", Boolean(value))
                }
                error={
                  formik.touched.terms_accepted && formik.errors.terms_accepted
                }
              />
              <label className="text-xs font-semibold">
                I agree to the Reseller Terms & Policies and understand the
                commission structure, lead policy, and code of conduct.
              </label>
            </div>
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
