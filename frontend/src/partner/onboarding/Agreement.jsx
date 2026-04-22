import React from "react";
import HeaderProgress from "./components/HaederProgress";
import PartnerLayout from "./components/Layout";
import { Textarea } from "@pages/components/ui/textarea";
import { Checkbox } from "@pages/components/ui/checkbox";
import { Button } from "@pages/components/ui/button";
import { MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Agreement = () => {
  const navigate = useNavigate();
  return (
    <PartnerLayout>
      <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-4">
        <HeaderProgress currentStep={2} />
        <div className=" px-4 gap-4 flex flex-col">
          <span className="flex text-md font-semibold">
            Resseller Esstential
          </span>
          <Textarea
            label=""
            rows={8}
            // value={content}
            // onChange={(event) => setContent(event.target.value)}
            // disabled={isFetching || isCreating}
          />

          <div className="flex items-center gap-4">
            <Checkbox
            // checked={formik.values.is_terms_and_conditions}
            // onCheckedChange={val =>
            //   formik.setFieldValue('is_terms_and_conditions', val)
            // }
            />
            <label className="text-xs font-semibold">
              I agree to the Reseller Terms & Policies and understand the
              commission structure, lead policy, and code of conduct.
            </label>
          </div>
          <Button
          onClick={() => navigate('/payment')}
            size="addbutton"
            type="button"
            className="w-full justify-center"
          >
            Continue to Agreement <MoveRight />
          </Button>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default Agreement;
