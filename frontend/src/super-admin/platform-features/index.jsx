import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Boxes, Plus } from "lucide-react";
import PlatformFeatureCards from "./components/platformFeatureCards";
import { Button } from "@pages/components/ui/button";
import AddplatformFeature from "./components/modals/AddplatformFeature";
import { useState } from "react";

const PlatformFeatures = () => {
  const [open, setOpen] = useState(false);

  return (
    <ContentLayout>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Left Section */}
          <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-4">
            <div className="p-2 sm:p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <Boxes
                size={24}
                className="text-onboard_primary sm:w-[30px] sm:h-[30px]"
              />
            </div>

            <div className="flex flex-col justify-center gap-1 sm:gap-2">
              <p className="text-base sm:text-[18px] font-semibold text-[#3A3A3A]">
                Platform Features
              </p>

              <p className="text-xs sm:text-[14px] font-medium text-[#393636]">
                Manage Platform Features
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="px-2 sm:px-5 w-full sm:w-auto">
            <Button
              size="addbutton"
              className="w-full sm:w-auto justify-center"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </div>

        <AddplatformFeature open={open} setOpen={setOpen} />

        {/* Cards */}
        <div className="mt-4">
          <PlatformFeatureCards />
        </div>
      </div>
    </ContentLayout>
  );
};

export default PlatformFeatures;