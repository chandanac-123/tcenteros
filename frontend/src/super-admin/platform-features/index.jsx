import ContentLayout from "@common/MasterLayout/ContentLayout"
import { Boxes, Plus } from "lucide-react"
import PlatformFeatureCards from "./components/platformFeatureCards"
import { Button } from "@pages/components/ui/button"
import AddplatformFeature from "./components/modals/AddplatformFeature"
import { useState } from "react"

const PlatformFeatures = () => {
const [open, setOpen] = useState(false);
  return (
    <ContentLayout>
      <div className="">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 p-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <Boxes size={30} className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-3">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Platform Features
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                Manage Platform Features
              </p>
            </div>
          </div>

          <div className="pe-5">
            <Button size="addbutton"  onClick={() => setOpen(true)}>
              <Plus />
              Add Feature
            </Button>
          </div>
        </div>
        <AddplatformFeature open={open} setOpen={setOpen} />

        <PlatformFeatureCards />
      </div>
    </ContentLayout>
  )
}

export default PlatformFeatures
