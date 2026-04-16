import ContentLayout from "@common/MasterLayout/ContentLayout";
import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import active_centers from "@assets/superadmin-dashboard/activecenter.svg";
import active_partners from "@assets/superadmin-dashboard/partner.svg";
import monthly_revenue from "@assets/superadmin-dashboard/revenue.svg";
import yearly_revenue from "@assets/superadmin-dashboard/locked-revenue.svg";
import new_center from "@assets/superadmin-dashboard/new-center.svg";
import branching from "@assets/superadmin-dashboard/branching.svg";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import { Button } from "@pages/components/ui/button";

const DetailView = () => {
  return (
    <ContentLayout>
      <div className="flex justify-between">
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
        <Button>abc</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <HeaderCard />
      </div>
    </ContentLayout>
  );
};

export default DetailView;
