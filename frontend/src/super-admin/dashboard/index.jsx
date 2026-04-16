import ContentLayout from "@common/MasterLayout/ContentLayout";
import { getGreeting } from "@utils/helper";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@pages/components/ui/card";
import LineChart from "@common/charts/LineChart";
import CustomDatePicker from "@common/components/CustomeDatepicker";
import HeaderCard from "./components/HeaderCards";
import BaseCard from "./components/BaseCard";
import active_partner from "@assets/superadmin-dashboard/active-partner.svg";
import revenue from "@assets/superadmin-dashboard/revenue.svg";
import commision from "@assets/superadmin-dashboard/commision.svg";
import MultiRingChart from "@common/charts/MultiRingChart";
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

const SuperAdminDashboard = () => {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 300000); //  every 5 min is enough
    return () => clearInterval(interval);
  }, []);

  const PartnerData = [
    {
      label: "Total Active Centers",
      value: 0,
      icon: active_partner,
    },
    {
      label: "New Centers This Month",
      value: 0,
      icon: revenue,
    },
    {
      label: "Commission Payable",
      value: 0,
      icon: commision,
    },
  ];

  const GrowingCentrs = [
    {
      label: "Yoga Hub Bangalore",
      sublabel: "Yoga Hub Bangalore",
      value: 0,
      growingCenter: true,
    },
    {
      label: "Pilates Plus Hyderabad",
      sublabel: "Pilates Plus Hyderabad",
      value: -8,
      growingCenter: true,
    },
    {
      label: "Commission Payable",
      sublabel: "Pilates Plus Hyderabad",
      value: 7,
      growingCenter: true,
    },
    {
      label: "Commission Payable",
      sublabel: "Pilates Plus Hyderabad",
      value: 7,
      growingCenter: true,
    },
    {
      label: "Commission Payable",
      sublabel: "Pilates Plus Hyderabad",
      value: 7,
      growingCenter: true,
    },
  ];

  const chartData = [
  { label: "Monthly Subscriptions", value: 62, color: "#4DB6AC" },
  { label: "Yearly Subscriptions", value: 29, color: "#B57CC2" },
  { label: "Network Subscriptions", value: 26, color: "#E6A57A" },
  { label: "Via Partners", value: 12, color: "#3BA3C9" },
  { label: "Branching", value: 12, color: "#7E57C2" },
];

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
    <ContentLayout>
      <div className="gap-4 flex flex-col">
        <div className="flex flex-col">
          <span>{greeting}</span>
          <span className="text-xs">
            Here is your platform overview and key metrics
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <HeaderCard cardsData={cardsData} dashboardHead={true}/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Chart Section */}
          <div className="lg:col-span-3">
            <Card className="p-4 h-full ">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <span className="font-semibold text-base">
                  Saas Revenue Trend
                </span>
                <span>
                  <CustomDatePicker pickerType="year" />
                </span>
              </div>
              <LineChart
                datasets={[
                  {
                    label: "New Leads",
                    data: [500, 200, 3000, 1500, 800, 1200],
                    borderColor: "#3B82F6",
                  },
                ]}
                yMin={0}
                yMax={10000}
                tickFormat={(v) => (v >= 1000 ? v / 1000 + "k" : v)}
              />
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-4 h-full gap-4 flex flex-col">
              <span className="font-semibold text-base gap-2">
                Partner Snapshot
              </span>
              <div className="flex flex-col gap-3">
                {PartnerData?.map((item, index) => (
                  <BaseCard key={index} data={item} />
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card className="p-4 h-full ">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <span className="font-semibold text-base">
                  Revenue Split by Source
                </span>
              </div>
              <MultiRingChart dataConfig={chartData} />
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-4 h-full flex flex-col gap-3">
              <span className="font-semibold text-base">
                Top 5 Growing Centers
              </span>
              <div className="flex flex-col gap-3">
                {GrowingCentrs?.map((item, index) => (
                  <BaseCard
                    key={index}
                    data={item}
                    growingCenter={item.growingCenter}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default SuperAdminDashboard;
