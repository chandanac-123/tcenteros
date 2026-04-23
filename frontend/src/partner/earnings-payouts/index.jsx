import ContentLayout from "@common/MasterLayout/ContentLayout";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import {
  BadgeDollarSign,
  Briefcase,
  ClipboardClock,
  Download,
  NotepadText,
  UserPlus,
  UserRoundCog,
} from "lucide-react";
import React from "react";
import EarningPayoutTable from "./EarningPayoutTable";
import { Button } from "@pages/components/ui/button";
import CustomDatePicker from "@common/components/CustomeDatepicker";
import CustomFilter from "@common/components/CustomeFilter";

const EarningsAndPayouts = () => {
  const cardsData = [
    {
      label: "Total Earnings",
      value: 5,
      icon: <BadgeDollarSign />,
    },
    {
      label: "Pending Payouts",
      value: 4,
      icon: <ClipboardClock />,
    },
    {
      label: "Active Leads",
      value: 5,
      icon: <UserPlus />,
    },
    {
      label: "Conversion Rate",
      value: 5,
      icon: <Briefcase />,
    },
  ];
  return (
    <ContentLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <NotepadText size={30} className="text-onboard_primary" />
          </div>
          <div className="flex flex-col justify-center gap-3">
            <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Earnings & Payouts
            </p>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              Commission tracking & payout management
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <HeaderCard cardsData={cardsData} />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Transactions</span>
            <div className="flex gap-3">
              <CustomFilter filterName="All Status" />
              <Button size="addbutton">
                <Download />
               Export
              </Button>
            </div>
          </div>
          <EarningPayoutTable />
        </div>
      </div>
    </ContentLayout>
  );
};

export default EarningsAndPayouts;
