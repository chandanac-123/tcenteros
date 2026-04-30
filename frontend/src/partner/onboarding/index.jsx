import React, { useState } from "react";

import PartnerLayout from "./components/Layout";
import HeaderProgress from "./components/HaederProgress";
import { Input } from "@pages/components/ui/input";
import { Button } from "@pages/components/ui/button";
import { useFormik } from "formik";
import CitySelect from "@common/components/CitySelect";
import StateSelect from "@common/components/StateSelect";
import CountrySelect from "@common/components/CountrySelect";
import { Textarea } from "@pages/components/ui/textarea";
import { ChevronDown, MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboardingStore } from "@store/onboardingStore";
import { partnerOnboardingValidationSchema } from "@utils/validations";

const PartnerOnboarding = () => {
  const navigate = useNavigate();
  const [showBankDetails, setShowBankDetails] = useState(false);
  const partnerOnboardingDraft = useOnboardingStore(
    (state) => state.partnerOnboardingDraft,
  );
  const setPartnerOnboardingDraft = useOnboardingStore(
    (state) => state.setPartnerOnboardingDraft,
  );

  const initialValues = {
    full_name: partnerOnboardingDraft?.full_name || "",
    email: partnerOnboardingDraft?.email || "",
    mobile: partnerOnboardingDraft?.mobile || "",
    address_line_1: partnerOnboardingDraft?.address_line_1 || "",
    country: partnerOnboardingDraft?.country || "",
    state: partnerOnboardingDraft?.state || "",
    city: partnerOnboardingDraft?.city || "",
    previous_sales_experience:
      partnerOnboardingDraft?.previous_sales_experience || "",
    account_holder_name: partnerOnboardingDraft?.account_holder_name || "",
    bank_name: partnerOnboardingDraft?.bank_name || "",
    account_number: partnerOnboardingDraft?.account_number || "",
    ifsc_code: partnerOnboardingDraft?.ifsc_code || "",
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: partnerOnboardingValidationSchema(showBankDetails),
    onSubmit: async (values) => {
      try {
        setPartnerOnboardingDraft(values);
        navigate("/agreement");
      } catch (error) {}
    },
  });
  return (
    <PartnerLayout>
      <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-4">
        <HeaderProgress currentStep={1} />
        <div className="flex gap-3 flex-col">
          <span className="flex text-md font-semibold">Basic Information</span>

          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2 px-4 "
            onSubmit={formik.handleSubmit}
          >
            <Input
              label="Full Name"
              name="full_name"
              value={formik.values.full_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.full_name && formik.errors.full_name}
            />
            <Input
              label="Phone Number"
              name="mobile"
              value={formik.values.mobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.mobile && formik.errors.mobile}
            />
            <Input
              label="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && formik.errors.email}
            />

            <div>
              <CitySelect
                country={formik.values.country}
                value={formik.values.city}
                onChange={(data) => {
                  formik.setFieldValue("city", data.city);
                  formik.setFieldValue("state", data.state);
                  formik.setFieldValue("country", data.country);
                }}
                label="City"
              />
              {formik.touched.city && formik.errors.city && (
                <div className="text-xs text-red_text mt-1">{formik.errors.city}</div>
              )}
            </div>
            <StateSelect
              country={formik.values.country}
              value={formik.values.state}
              onChange={(val) => formik.setFieldValue("state", val)}
              label="State"
            />
            <CountrySelect
              value={formik.values.country}
              onChange={(val) => {
                formik.setFieldValue("country", val.country);
              }}
              label="Country"
            />
            <Textarea
              label="Address"
              name="address_line_1"
              rows={3}
              value={formik.values.address_line_1}
              onChange={formik.handleChange}
            />
            <Textarea
              label="Previous Sales Experience (Optional)"
              name="previous_sales_experience"
              rows={3}
              value={formik.values.previous_sales_experience}
              onChange={formik.handleChange}
            />

            <button
              type="button"
              className="flex items-center gap-1 text-sm text-onboard_primary md:col-span-2"
              onClick={() => setShowBankDetails((prev) => !prev)}
            >
              {showBankDetails ? "Hide bank details" : "Add bank details"}
              <ChevronDown
                className={`transition-transform duration-200 ${showBankDetails ? "rotate-180" : ""}`}
              />
            </button>
            {showBankDetails && (
              <>
                <span className="flex text-md font-semibold md:col-span-2">
                  Bank Details
                </span>
                <Input
                  label="Account Holder Name "
                  name="account_holder_name"
                  value={formik.values.account_holder_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.account_holder_name &&
                    formik.errors.account_holder_name
                  }
                />
                <Input
                  label="Bank Name "
                  name="bank_name"
                  value={formik.values.bank_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.bank_name && formik.errors.bank_name}
                />
                <Input
                  label="Account Number "
                  name="account_number"
                  value={formik.values.account_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.account_number && formik.errors.account_number
                  }
                />
                <Input
                  label="IFSC Code "
                  name="ifsc_code"
                  value={formik.values.ifsc_code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.ifsc_code && formik.errors.ifsc_code}
                />
              </>
            )}

            <div className="flex w-full justify-center md:col-span-2">
              <Button size="addbutton" type="submit" className="w-full bg-onboard_primary hover:bg-onboard_primary  justify-center">
                Continue to Agreement <MoveRight />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerOnboarding;
