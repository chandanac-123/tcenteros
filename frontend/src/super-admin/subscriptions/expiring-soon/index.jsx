import ContentLayout from "@common/MasterLayout/ContentLayout";
import React from "react";

const ExpiringSoon = () => {
  return (
    <ContentLayout>
      <div className="flex items-center gap-4 p-4">
        <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
          {/* <Handshake size={30} className="text-onboard_primary" /> */}
        </div>
        <div className="flex flex-col justify-center gap-3">
          <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
            Partners Management
          </p>
          <p className="text-[#393636] font-inter text-[14px] font-medium">
            Manage reseller partners and commissions
          </p>
        </div>
      </div>
    </ContentLayout>
  );
};

export default ExpiringSoon;
