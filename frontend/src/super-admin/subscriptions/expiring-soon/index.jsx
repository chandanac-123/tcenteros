import ContentLayout from "@common/MasterLayout/ContentLayout";
import { ClockAlert } from "lucide-react";
import ExpiringTable from "./ExpiringTable";

const ExpiringSoon = () => {
  return (
    <ContentLayout>
      <div className="flex items-center gap-4 p-4">
        <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
         <ClockAlert size={30}  className="text-onboard_primary" />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
           Expiring Soon
          </p>
          <p className="text-[#393636] font-inter text-[14px] font-medium">
            14 centres require renewal attention
          </p>
        </div>
      </div>
      <ExpiringTable/>
    </ContentLayout>
  );
};

export default ExpiringSoon;
