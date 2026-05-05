import {
  Book,
  CircleDollarSign,
  FileBadge,
  FolderSync,
  HandCoins,
  RefreshCcw,
  Network,
  Split,
  Lock,
} from "lucide-react";
import React from "react";
import LineChart from "@common/charts/LineChart";
import DoughnutChart from "@common/charts/DoughnutChart";
import LineBarChart from "./LineBarChart";
import { useRevenueBillingOverviewQuery } from "@api-queries/super-admin/revenue-billing/Query";
import DashboardHeaderCard from "@super-admin/dashboard/components/HeaderCards";

const SASRevenue = () => {
  const { data, isLoading } = useRevenueBillingOverviewQuery();
  console.log("Card data: ", data);
  // Line chart data from API
  const datasets = [
    {
      label: "Revenue",
      data: data?.mrr_trend?.map((item) => item.value) || [],
      borderColor: "#03881B",
      backgroundColor: "#03881B",
    },
  ];

  // Doughnut and bar chart data from API
  const doughnutData = data?.revenue_breakdown || [];
  const values = doughnutData.map((item) => item.value);
  const labels = doughnutData.map((item) => item.label);
  // Assign colors for up to 4 segments, fallback to default if more
  const defaultColors = ["#344BFD", "#FFD200", "#8B24E2", "#F4A79D", "#F68D2B"];
  const colors = doughnutData.map(
    (item, idx) => defaultColors[idx % defaultColors.length],
  );

  const cardsData = [
    {
      label: " Monthly Recurring Revenue (MRR)",
      value: data?.monthly_recurring_revenue?.value || 0,
      icon: <HandCoins size={16} strokeWidth={2.75} />,
      type: "amount",
      percent: data?.monthly_recurring_revenue?.percent_of_total_income || 0,
    },
    {
      label: " Yearly Locked Revenue (ARR)",
      value: data?.yearly_locked_revenue_arr?.value || 0,
      icon: <Lock size={16} strokeWidth={2.75} />,
      type: "amount",
      percent: data?.yearly_locked_revenue_arr?.percent_of_total_income || 0,
    },
    {
      label: " 30 Days Renewal Forecast",
      value: data?.renewal_forecast_30_days?.value || 0,
      icon: <RefreshCcw size={16} strokeWidth={2.75} />,
      type: "amount",
      percent: data?.renewal_forecast_30_days?.percent_of_total_income || 0,

    },
    {
      label: "Pending Commission Payout",
      value: data?.pending_commission_payout?.value || 0,
      icon: <Book size={16} strokeWidth={2.75} />,
      type: "amount",
      percent: data?.pending_commission_payout?.percent_of_total_expense || 0,

    },
    {
      label: " Subscriptions",
      value: data?.revenue_cards?.center_subscription?.value || 0,
      icon: <FileBadge size={16} strokeWidth={2.75} />,
      type: "amount",
      percent: data?.revenue_cards?.center_subscription.percent || 0,

    },
    {
      label: "Subscription Renewals",
      value: data?.revenue_cards?.center_subscription_renewal?.value || 0,
      icon: <FolderSync size={16} strokeWidth={2.75} />,
      type: "amount",
      percent: data?.revenue_cards?.center_subscription_renewal.percent || 0,
    },
    {
      label: "Branch Purchases",
      value: data?.revenue_cards?.branch_purchase?.value || 0,
      icon: <Split size={16} strokeWidth={2.75} />,
      percent: data?.revenue_cards?.branch_purchase.percent || 0,
      type: "amount",
    },
    {
      label: " Network Commission",
      value: data?.revenue_cards?.network_commission.value || 0,
      icon: <Network size={16} strokeWidth={2.75} />,
      type: "amount",
      percent: data?.revenue_cards?.network_commission.percent || 0,
    },
  ];
  return (
    <div>
      <div className="flex items-center gap-4 p-4">
        <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
          <CircleDollarSign size={30} className="text-onboard_primary" />
        </div>
        <div className="flex flex-col justify-center gap-3">
          <h1 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
            Revenue & Billing
          </h1>
          <p className="text-[#393636] font-inter text-[14px] font-medium">
            Track SaaS revenue and partner commissions
          </p>
        </div>
      </div>

      <div className="px-4 gap-3 flex flex-col">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <DashboardHeaderCard dashboardHead={true} cardsData={cardsData} />
        </div>
        <div className="px-4 py-5 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-lg">
          <h2 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold pb-3">
            Monthly Recurring Revenue Trend
          </h2>
          <LineChart
            datasets={datasets}
            yMin={0}
            yMax={500}
            tickFormat={(val) => `₹${val}`}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="w-full  flex items-stretch justify-betwwen gap-5 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-lg p-8">
          <div className="w-[40%] flex  items-center justify-center  p-5 rounded-lg">
            <div className="w-[50%]">
              <DoughnutChart
                values={values}
                labels={labels}
                colors={colors}
                cutout="80%"
              />
            </div>
          </div>

          <div className="w-[70%] p-5 rounded-lg flex items-center justify-center">
            <LineBarChart data={doughnutData} colors={colors} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SASRevenue;
