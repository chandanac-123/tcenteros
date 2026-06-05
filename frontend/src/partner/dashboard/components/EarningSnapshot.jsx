import { Progress } from "@pages/components/ui/progress";
import { BadgeDollarSign, CalendarClock, CalendarPlus2 } from "lucide-react";
import React from "react";

const earningColorClasses = {
  onboard_primary: {
    text: "text-onboard_primary",
    indicator: "bg-onboard_primary",
  },
  partner_green: {
    text: "text-partner_green",
    indicator: "bg-partner_green",
  },
  partner_red: {
    text: "text-partner_red",
    indicator: "bg-partner_red",
  },
};

const EarningSnapshot = ({ data }) => {
  console.log('data: ', data);
  const earningsData = [
    {
      id: 1,
      title: "Total Earnings",
      amount:data?.total_earnings,
      progress: data?.total_earnings,
      icon: <BadgeDollarSign />,    
      color: "onboard_primary",
    },
    {
      id: 2,
      title: "Earnings This Month",
      amount: data?.this_month_earnings,
      progress: data?.this_month_earnings,
      icon: <CalendarPlus2 />,
      color: "partner_green",
    },
    {
      id: 3,
      title: "Earnings Payouts",
      amount:data?.pending_payout,
      icon: <CalendarClock />,
      progress: data?.pending_payout,
      color: "partner_red",
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      {earningsData?.map((earning) => {
        const colorClass =
          earningColorClasses[earning.color] ||
          earningColorClasses.onboard_primary;

        return (
          <div key={earning.id} className="flex flex-col border rounded-lg p-3 gap-3">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className=" p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.15)]">
                 {earning.icon}
                </div>
                <span className="text-sm">{earning.title}</span>
              </div>
              <span className={`text-lg font-semibold ${colorClass.text}`}>
                {earning.amount}
              </span>
            </div>
            <Progress
              value={earning.progress}
              className="w-full"
              indicatorClassName={colorClass.indicator}
            />
          </div>
        );
      })}
    </div>
  );
};

export default EarningSnapshot;
