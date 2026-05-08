import ContentLayout from "@common/MasterLayout/ContentLayout";
import { formatIndianCurrency, getGreeting } from "@utils/helper";
import { useEffect, useState } from "react";
import { Card } from "@pages/components/ui/card";
import LineChart from "@common/charts/LineChart";
import CustomDatePicker from "@common/components/CustomeDatepicker";
import BaseCard from "./components/BaseCard";
import MultiRingChart from "@common/charts/MultiRingChart";
import DashboardHeaderCard from "./components/HeaderCards";
import {
  Briefcase,
  Building,
  Building2,
  NotebookPen,
  Users,
  CalendarSearch,
  CircleAlert,
  Handshake,
  Network,
  Receipt,
  Split,
  TriangleAlert,
} from "lucide-react";
import { useDashboardOverviewQuery } from "@api-queries/super-admin/superadmin-dashboard/Query";
import GrowingCenterCard from "./components/GrowingCenterCard";

const SuperAdminDashboard = () => {
  const [greeting, setGreeting] = useState(getGreeting());
  const { data, isLoading } = useDashboardOverviewQuery();
  console.log("data: ", data);
  const revenueTrend = data?.revenue_trend || [];
  // const revenueSplit = data?.revenue_split || [];
  const colors = ["#4DB6AC", "#B57CC2", "#E6A57A", "#3BA3C9", "#7E57C2"];

  console.log("Dash-Data", data);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 300000); //  every 5 min is enough
    return () => clearInterval(interval);
  }, []);

  const linechartData = revenueTrend.map((item) => item.revenue);
  const chartLabels = revenueTrend.map((item) => item.month);

  const PartnerData = [
    {
      label: "Active Partners",
      value: data?.partner_snapshot?.active_partner_count,
      icon: <Users size={16} strokeWidth={2.75} />,
      type: "count",
    },
    {
      label: "Sales via Partners",
      value: formatIndianCurrency(data?.partner_snapshot?.revenue_via_partner),
      icon: <Receipt size={16} strokeWidth={2.75} />,
      type: "amount",
    },
    {
      label: "Commission Payable",
      value: formatIndianCurrency(data?.partner_snapshot?.commission_payable),
      icon: <NotebookPen size={16} strokeWidth={2.75} />,
      type: "amount",
    },
  ];


  // const chartData = revenueSplit.map((item, index) => ({
  //   label: item.label,
  //   value: item.percent, // 👈 IMPORTANT: use percent for doughnut
  //   color: colors[index % colors.length],
  // }));

  const cardsData = [
    {
      label: "Total Active Centers",
      value: data?.kpis?.total_active_centers?.value,
      icon: <Building2 size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/employee-management"),
      percent: data?.kpis?.total_active_centers?.percentage,
    },
    {
      label: "New Centers This Month",
      value: data?.kpis?.new_centers_this_month?.value,
      icon: <Building size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/crm/members"),
      percent: data?.kpis?.new_centers_this_month?.percentage,
    },
    {
      label: "Monthly Recurring Revenue",
      value: formatIndianCurrency(data?.kpis?.monthly_recurring_revenue),
      icon: <Receipt size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/membership-plan?tab=active"),
      type: "amount",
    },
    {
      label: "Yearly Locked Revenue",
      value: formatIndianCurrency(data?.kpis?.yearly_locked_revenue),
      icon: <Briefcase size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/crm?tab=leads"),
      type: "amount",
    },
    {
      label: "Branching Earning",
      value: formatIndianCurrency(data?.kpis?.branching_earnings),
      icon: <Split size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/crm?tab=guests"),
      type: "amount",
    },
    {
      label: "Partner Earning",
      value: data?.kpis?.partner_commission,
      icon: <Handshake size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/crm?tab=guests"),
      type: "amount",
    },
    {
      label: "Network Earning",
      value:formatIndianCurrency(data?.kpis?.network_earnings),
      icon: <Network size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/attendance"),
      type: "amount",
    },
    {
      label: "Upcoming Renewal Value",
      value: data?.kpis?.upcoming_renewal_value,
      icon: <CalendarSearch size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/accounts"),
    },
    {
      label: "Churn Rate",
      value: data?.kpis?.churn_rate,
      icon: <CircleAlert size={16} strokeWidth={2.75} />,
      onClick: () => navigate("/accounts"),
      type: "percent",
    },
    {
      label: "Failed Payments Value",
      value: formatIndianCurrency(data?.kpis?.failed_payments?.amount),
      icon: <TriangleAlert size={16} strokeWidth={2.75} />,
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
          <DashboardHeaderCard dashboardHead={true} cardsData={cardsData} />
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
                labels={chartLabels} // if your component supports labels
                datasets={[
                  {
                    label: "SaaS Revenue",
                    data: linechartData,
                    borderColor: "#3B82F6",
                  },
                ]}
                yMin={0}
                yMax={Math.max(...linechartData, 1000)}
                yStep={500} //  ADD THIS
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
              {/* <MultiRingChart dataConfig={chartData} /> */}
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-4 h-full flex flex-col gap-3">
              <span className="font-semibold text-base">
                Top 5 Growing Centers
              </span>
              <div className="flex flex-col gap-3">
                {data?.top_growing_centers?.map((item, index) => (
                  <GrowingCenterCard
                    key={index}
                    data={item}
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
