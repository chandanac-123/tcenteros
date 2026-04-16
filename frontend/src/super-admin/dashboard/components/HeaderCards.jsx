import { TrendingDown, TrendingUp } from "lucide-react";
import active_centers from "@assets/superadmin-dashboard/activecenter.svg";
import active_partners from "@assets/superadmin-dashboard/partner.svg";
import monthly_revenue from "@assets/superadmin-dashboard/revenue.svg";
import yearly_revenue from "@assets/superadmin-dashboard/locked-revenue.svg";
import upcoming_renewal from "@assets/superadmin-dashboard/upcoming_renewal.svg";
import new_center from "@assets/superadmin-dashboard/new-center.svg";
import branching from "@assets/superadmin-dashboard/branching.svg";
import network from "@assets/superadmin-dashboard/network.svg";
import churn from "@assets/superadmin-dashboard/churn.svg";
import failed_payment from "@assets/superadmin-dashboard/failed-payment.svg";
import TrendBadge from "@common/components/TrendBadge";
import { useNavigate } from "react-router-dom";

const HeaderCard = ({ data }) => {
   const navigate = useNavigate();
  const cardsData = [
    {
      label: "Total Active Centers",
      value: 0,
      icon: active_centers,
      onClick: () => navigate("/employee-management"),
    },
    {
      label: "New Centers This Month",
      value: 0,
      icon: new_center,
      onClick: () => navigate("/crm/members"),
    },
    {
      label: "Monthly Recurring Revenue",
      value: 0,
      icon: monthly_revenue,
      onClick: () => navigate("/membership-plan?tab=active"),
    },
    {
      label: "Yearly Locked Revenue",
      value: 0,
      icon: yearly_revenue,
      onClick: () => navigate("/crm?tab=leads"),
    },
    {
      label: "Branching Earning",
      value: 0,
      icon: branching,
      onClick: () => navigate("/crm?tab=guests"),
    },
    {
      label: "Partner Earning",
      value: 0,
      icon: active_partners,
      onClick: () => navigate("/crm?tab=guests"),
    },
    {
      label: "Network Earning",
      value: 0,
      icon: network,
      onClick: () => navigate("/attendance"),
    },
    {
      label: "Upcoming Renewal Value",
      value: 0,
      icon: upcoming_renewal,
      onClick: () => navigate("/accounts"),
    },
    {
      label: "Churn Rate",
      value: 0,
      icon: churn,
      onClick: () => navigate("/accounts"),
    },
    {
      label: "Failed Payments Value",
      value: 0,
      icon: failed_payment,
      onClick: () => navigate("/accounts"),
    },
  ];
  return (
    <>
      {cardsData?.map((item, index) => (
        <div
          key={index}
          onClick={item.onClick}
          className="w-full h-28 cursor-pointer flex flex-col justify-between p-4 bg-textwhite rounded-xl shadow-primary-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <img src={item?.icon} alt={item?.label} className="w-8 h-8" />
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

export default HeaderCard;
