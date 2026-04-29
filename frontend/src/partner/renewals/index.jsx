import CustomFilter from "@common/components/CustomeFilter";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Button } from "@pages/components/ui/button";
import {
  Briefcase,
  CalendarClock,
  ChartLine,
  Download,
  NotepadText,
} from "lucide-react";
import React from "react";
import RenewalTable from "./RenewalTable";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import { useRenewalsQuery } from "@api-queries/partner/renewal/Query";

const Renewals = () => {
  const [tableParams, setTableParams] = React.useState({
    page: 1,
    status: "",
  });
  const { data, isLoading } = useRenewalsQuery(tableParams);
  const cardsData = [
    {
      label: "Renewals Overdue",
      value: data?.summary?.renewals_overdue || 0,
      icon: <CalendarClock />,
      type: "count",
    },
    {
      label: "Renewal Earnings",
      value: data?.summary?.renewal_earnings || 0,
      icon: <CalendarClock />,
      type: "amount",
    },
    {
      label: "Renewal Rate",
      value: data?.summary?.renewal_rate || 0,
      icon: <ChartLine />,
      type: "percent",
    },
    {
      label: "Renewal  Commission",
      value: data?.summary?.renewal_commission || 0,
      icon: <Briefcase />,
      type: "amount",
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
              Renewals Management
            </p>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              Track, remind & retain your clients
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <HeaderCard cardsData={cardsData} />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Transactions</span>
            {/* <div className="flex gap-3">
              <CustomFilter filterName="All Status" />
              <Button size="addbutton">
                <Download />
                Export
              </Button>
            </div> */}
          </div>
          <RenewalTable
            data={data}
            isLoading={isLoading}
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        </div>
      </div>
    </ContentLayout>
  );
};

export default Renewals;
