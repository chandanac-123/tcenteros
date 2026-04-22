import PartnerLayout from "./components/Layout";
import HeaderProgress from "./components/HaederProgress";
import { Card } from "@pages/components/ui/card";
import { CircleCheck, MoveRight } from "lucide-react";
import { Button } from "@pages/components/ui/button";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const navigate = useNavigate();
  return (
    <PartnerLayout>
      <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-4">
        <HeaderProgress currentStep={3} />
        <div className="flex flex-col p-8 gap-4">
          <Card>
            <div className="flex flex-col p-8">
              <span className="flex text-md font-semibold">
                Complete Payment
              </span>
              <div className="flex bg-grey/5 justify-between items-center p-6 rounded-lg mt-4">
                <div>
                  <span className="flex text-md font-semibold">
                    Onboarding Fee
                  </span>
                  <span className="flex text-md ">
                    One-time registration fee to activate your reseller account
                  </span>
                </div>
                <div>2500</div>
              </div>

              <div className="flex bg-grey/5  items-center p-6 rounded-lg mt-4">
                <div className="flex flex-col gap-2">
                  <span className="flex text-md font-semibold">
                    What you get after payment:
                  </span>
                  <div className="flex flex-col px-8">
                    <span className="flex text-md text-textgrey gap-2">
                      <CircleCheck className="text-onboard_primary bg-text-white w-4 rounded-full " />{" "}
                      Instant access to reseller dashboard
                    </span>
                    <span className="flex text-md text-textgrey gap-2">
                      <CircleCheck className="text-onboard_primary bg-text-white w-4 rounded-full " />{" "}
                      Unique Reseller ID and territory assignment
                    </span>
                    <span className="flex text-md text-textgrey gap-2">
                      <CircleCheck className="text-onboard_primary bg-text-white w-4 rounded-full " />{" "}
                      Sales materials and training resource
                    </span>
                    <span className="flex text-md text-textgrey gap-2 ">
                      <CircleCheck className="text-onboard_primary bg-text-white w-4 rounded-full " />{" "}
                      Start receiving leads immediately
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <div className="flex w-full justify-center md:col-span-2">
            <Button
              size="addbutton"
              type="button"
              onClick={() => navigate("/payment-successful")}
              className="w-full justify-center bg-[#088217] hover:bg-[#088217]"
            >
              Pay 2,500 & Activate Account
            </Button>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default Payment;
