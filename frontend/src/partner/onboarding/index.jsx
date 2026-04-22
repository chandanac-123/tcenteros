import React, { useState } from "react";

import PartnerLayout from "./components/Layout";
import HeaderProgress from "./components/HaederProgress";
import CustomeSelect from "@common/components/CustomeSelect";
import { Input } from "@pages/components/ui/input";
import { Button } from "@pages/components/ui/button";
import { useFormik } from "formik";
import CitySelect from "@common/components/CitySelect";
import StateSelect from "@common/components/StateSelect";
import CountrySelect from "@common/components/CountrySelect";
import { Textarea } from "@pages/components/ui/textarea";
import { ChevronDown, MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PartnerOnboarding = () => {
  const navigate = useNavigate();
  const [showBankDetails, setShowBankDetails] = useState(false);

  const initialValues = {
    full_name: "",
    email: "",
    mobile: "",
    country: "",
    state: "",
    city: "",
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
      } catch (error) {}
    },
  });
  return (
    <PartnerLayout>
      <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-4">
        <HeaderProgress currentStep={1} />
        <div className="flex gap-3 flex-col">
          <span className="flex text-md font-semibold">Basic Information</span>

          <form className="grid grid-cols-1 gap-4 md:grid-cols-2 px-4 ">
            <Input
              label="Full Name"
              name="salary"
              // value={formik.values.salary}
              // onChange={formik.handleChange}
              // error={formik.touched.salary && formik.errors.salary}
            />
            <Input
              label="Phone Number"
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
            />

            <CitySelect
              country={formik.values.countryCode}
              value={formik.values.city}
              onChange={(data) => {
                formik.setFieldValue("city", data.city);
                formik.setFieldValue("state", data.state); // auto-fill
                formik.setFieldValue("country", data.country); // auto-fill country
              }}
              label="City"
            />
            <StateSelect
              country={formik.values.countryCode}
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
              rows={3}
              // value={content}
              // onChange={(event) => setContent(event.target.value)}
              // disabled={isFetching || isCreating}
            />
            <Textarea
              label="Previous Sales Experience (Optional)"
              rows={3}
              // value={content}
              // onChange={(event) => setContent(event.target.value)}
              // disabled={isFetching || isCreating}
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
                  name="salary"
                  // value={formik.values.salary}
                  // onChange={formik.handleChange}
                  // error={formik.touched.salary && formik.errors.salary}
                />
                <Input
                  label="Bank Name "
                  name="salary"
                  // value={formik.values.salary}
                  // onChange={formik.handleChange}
                  // error={formik.touched.salary && formik.errors.salary}
                />
                <Input
                  label="Account Number "
                  name="salary"
                  // value={formik.values.salary}
                  // onChange={formik.handleChange}
                  // error={formik.touched.salary && formik.errors.salary}
                />
                <Input
                  label="IFSC Code "
                  name="salary"
                  // value={formik.values.salary}
                  // onChange={formik.handleChange}
                  // error={formik.touched.salary && formik.errors.salary}
                />
              </>
            )}

            <div className="flex w-full justify-center md:col-span-2">
              <Button  onClick={() => navigate('/agreement')} size="addbutton" type="button" className="w-full justify-center">
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
