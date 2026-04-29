import { CircleArrowDown, CircleDollarSign, RefreshCcw } from "lucide-react";
import React from "react";
import CommissionCards from "./CommissionCards";
import CommissionTable from "./CommissionTable";
import { Button } from "@pages/components/ui/button";
import { useRunAllCommissionsMutation } from "@api-queries/super-admin/revenue-billing/Query";

const PartnerCommision = () => {
  const { mutateAsync: runAllCommissions } = useRunAllCommissionsMutation();
  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4 p-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <CircleDollarSign size={30} className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-3">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Revenue & Billing
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                Track SaaS revenue and partner commissions{" "}
              </p>
            </div>
          </div>

          <div className="pe-5 gap-2 flex">
            <Button size="addbutton" onClick={() => setOpen(true)}>
              <CircleArrowDown />
              Export Report
            </Button>
            <Button size="addbutton" onClick={() => runAllCommissions()}>
              <RefreshCcw />
              Commision Run
            </Button>
          </div>
        </div>

        <div className="px-4">
          <CommissionCards />
        </div>

        <div className="px-4">
          <CommissionTable />
        </div>
      </div>
    </div>
  );
};

export default PartnerCommision;
