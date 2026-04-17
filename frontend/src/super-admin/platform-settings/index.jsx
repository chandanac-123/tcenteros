import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Card } from "@pages/components/ui/card";
import { Input } from "@pages/components/ui/input";
import { Settings } from "lucide-react";

const PlatformSettings = () => {
  return (
    <ContentLayout>
      <div>
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <Settings size={30} className="text-onboard_primary" />
          </div>
          <div className="flex flex-col justify-center gap-3">
            <h1 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Platform Settings
            </h1>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              Configure platform-wide revenue and subscription settings
            </p>
          </div>
        </div>
      </div>
      <Card>
        <div className="flex flex-col p-4 space-y-4">
          <span className="text-grey font-semibold">
            Revenu & Subscription Management
          </span>

          <div className="grid grid-cols-2 gap-4 ">
            <Input
              label="Default Yearly Discount (%)"
              name="mobile"
              placeholder="Enter Your Mobile Number"
            />
              <Input
              label="Default Partner Commission (%)"
              name="mobile"
              placeholder="Enter Your Mobile Number"
            />
              <Input
              label="Grace Period (Days)"
              name="mobile"
              placeholder="Enter Your Mobile Number"
            />
              <Input
              label="Payment Retry Attempts"
              name="mobile"
              placeholder="Enter Your Mobile Number"
            />
          </div>
        </div>
      </Card>
    </ContentLayout>
  );
};

export default PlatformSettings;
