import { useFailedSubscriptionsQuery } from "@api-queries/super-admin/subcriptions/Query";
import DeleteModal from "@common/components/CustomeDelete";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { useAppPermissions } from "@hooks/index";
import { Button } from "@pages/components/ui/button";
import { BanknoteX, FileExclamationPoint, TriangleAlert } from "lucide-react";
import { useState } from "react";
import FailedDataList from "./components/FailedDataList";

const FailedPayments = () => {




  return (
    <ContentLayout>
      <div className="bg- p-5">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4 p-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <FileExclamationPoint className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-2">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Failed Payments
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                This shows the inactive centers
              </p>
            </div>
          </div>

        </div>
      </div>


      <FailedDataList/>


    </ContentLayout>
  );
};

export default FailedPayments;
