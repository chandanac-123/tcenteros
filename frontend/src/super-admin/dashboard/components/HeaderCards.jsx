import {
  Briefcase,
  Building,
  Building2,
  CalendarSearch,
  CircleAlert,
  Handshake,
  Network,
  Receipt,
  Split,
  TriangleAlert,
} from "lucide-react";
import TrendBadge from "@common/components/TrendBadge";
import { useNavigate } from "react-router-dom";

const DashboardHeaderCard = ({ data }) => {
  const navigate = useNavigate();
  const cardsData = [
    {
      label: "Total Active Centers",
      value: 0,
      icon: <Building2 size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/employee-management"),
    },
    {
      label: "New Centers This Month",
      value: 0,
      icon: <Building size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/crm/members"),
    },
    {
      label: "Monthly Recurring Revenue",
      value: 0,
      icon: <Receipt size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/membership-plan?tab=active"),
    },
    {
      label: "Yearly Locked Revenue",
      value: 0,
      icon: <Briefcase size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/crm?tab=leads"),
    },
    {
      label: "Branching Earning",
      value: 0,
      icon: <Split size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/crm?tab=guests"),
    },
    {
      label: "Partner Earning",
      value: 0,
      icon: <Handshake size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/crm?tab=guests"),
    },
    {
      label: "Network Earning",
      value: 0,
      icon: <Network size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/attendance"),
    },
    {
      label: "Upcoming Renewal Value",
      value: 0,
      icon: <CalendarSearch size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/accounts"),
    },
    {
      label: "Churn Rate",
      value: 0,
      icon: <CircleAlert size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/accounts"),
    },
    {
      label: "Failed Payments Value",
      value: 0,
      icon: <TriangleAlert size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/accounts"),
    },
  ];
  return (
    <>
      {cardsData?.map((item, index) => (
        <div
          key={index}
          // onClick={item.onClick}
          className="w-full h-28  flex flex-col justify-between p-4 bg-textwhite rounded-xl shadow-primary-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className=" p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.10)]">
              {item?.icon}
            </div>
            <span className="text-xs font-medium text-grey">{item?.label}</span>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <span className="text-xl font-bold text-textblack">1,247</span>
            <TrendBadge value={12} />
          </div>
        </div>
      ))}
    </>
  );
};

export default DashboardHeaderCard;
