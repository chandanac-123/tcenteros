import { TrendingDown, TrendingUp } from "lucide-react";
import active_centers from "@assets/superadmin-dashboard/activecenter.svg";
import active_partners from "@assets/superadmin-dashboard/partner.svg";
import monthly_revenue from "@assets/superadmin-dashboard/revenue.svg";
import yearly_revenue from "@assets/superadmin-dashboard/locked-revenue.svg";
import upcoming_renewal from "@assets/superadmin-dashboard/upcoming_renewal.svg";
import new_center from "@assets/superadmin-dashboard/new-center.svg";
import branching from "@assets/superadmin-dashboard/branching.svg";


const HeaderCard = ({ data }) => {
 const cardsData = [
    {
      label: "Total Revenue",
      value: 0,
      icon: active_centers,
    },
    {
      label: "Monthly Revenue",
      value: 0,
      icon: new_center,
    },
    {
      label: "Renewal Date",
      value: 0,
      icon: monthly_revenue,
    },
    {
      label: "Days Remaining",
      value: 0,
      icon: yearly_revenue,
    },
    {
      label: "Network commission",
      value: 0,
      icon: branching,
    },
    {
      label: "Branch Count",
      value: 0,
      icon: active_partners,
    },
    
  ];
  return (
    <>
      {cardsData?.map((item, index) => (
        <div
          key={index}
          className="w-full h-24 cursor-pointer flex flex-col justify-between p-4 bg-textwhite rounded-xl shadow-primary-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <img src={item?.icon} alt={item?.label} className="w-8 h-8" />
            <span className="text-xs font-medium text-grey">{item?.label}</span>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <span className="text-xl font-bold text-textblack">1,247</span>
          </div>
        </div>
      ))}
    </>
  );
};

export default HeaderCard;
