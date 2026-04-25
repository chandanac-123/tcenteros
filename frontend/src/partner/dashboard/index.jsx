import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Card } from "@pages/components/ui/card";
import LeadsTableList from "@partner/leads-management/components/LeadsTableList";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import { getGreeting } from "@utils/helper";
import {
  BadgeDollarSign,
  Briefcase,
  ChevronDown,
  ClipboardClock,
  FileSearchCorner,
  FileSearchCornerIcon,
  NotepadText,
  UserPlus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import EarningSnapshot from "./components/EarningSnapshot";
import RenewalCard from "./components/RenewalCard";
import { useNavigate } from "react-router-dom";
import { usePartnerDashboardQuery } from "@api-queries/partner/dashboard/Query";

const PartnerDashboard = () => {
  const [greeting, setGreeting] = useState(getGreeting());
  const { data: partnerData } = usePartnerDashboardQuery();
  console.log('partnerData: ', partnerData);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 300000); //  every 5 min is enough
    return () => clearInterval(interval);
  }, []);

  const cardsData = [
    {
      label: "Total Earnings",
      value: 5,
      icon: <BadgeDollarSign />,
      type: "amount",
    },
    {
      label: "Pending Payouts",
      value: 4,
      icon: <ClipboardClock />,
      type: "amount",
    },
    {
      label: "Active Leads",
      value: 5,
      icon: <UserPlus />,
      type: "count",
    },
    {
      label: "Conversion Rate",
      value: 5,
      icon: <Briefcase />,
      type: "percent",
    },
  ];
  return (
    <ContentLayout>
      <div className="flex flex-col gap-3">
        <span>{greeting}</span>
        <span className="text-xs">
          Start managing leads and track your earnings below.
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <HeaderCard cardsData={cardsData} />
        </div>

        <Card>
          <LeadsTableList dashboarView={true} />
          <div className="flex justify-center p-2">
            <button
              className="flex  text-onboard_primary"
              onClick={() => navigate("/lead-management")}
            >
              Show more <ChevronDown />
            </button>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="h-full p-5">
            <div className="flex items-center gap-4">
              <div className="p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.15)]">
                <NotepadText />
              </div>
              <span className="text-md font-semibold">Earnings Snapshot</span>
            </div>
            <div className="mt-4 text-sm text-textgrey">
              <EarningSnapshot data={partnerData?.earnings_snapshot} />
            </div>
          </Card>
          <Card className="h-full p-5">
            <div className="flex items-center gap-4">
              <div className="p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.15)]">
                <FileSearchCornerIcon />
              </div>
              <span className="text-md font-semibold">Upcoming Renewals</span>
            </div>
            <div className="mt-4 text-sm text-textgrey">
              <RenewalCard />
            </div>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
};

export default PartnerDashboard;
