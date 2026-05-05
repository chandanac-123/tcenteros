import LineChart from "@common/charts/LineChart";
import CustomDatePicker from "@common/components/CustomeDatepicker";
import { Card } from "@pages/components/ui/card";
import RevenueCard from "@super-admin/subscriptions/components/RevenueCard";
import React from "react";

const RevenueSummary = ({ data }) => {
  // console.log("data: ", data);
  const revenueLabels = data?.revenue_chart?.map((i) => i.month) || [];

  const revenueData = data?.revenue_chart?.map((i) => i.revenue) || [];

  return (
    <div className="w-full p-4 border rounded-xl">
      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <span className="font-semibold text-base">Revenue Year Chart</span>
            <div>
              <CustomDatePicker pickerType="year" />
            </div>
          </div>
          <LineChart
           labels={revenueLabels}
            datasets={[
              {
                label: "Revenue",
                data: revenueData,
                borderColor: "#3B82F6",
              },
            ]}
            yMin={0}
            yMax={10000}
            tickFormat={(v) => (v >= 1000 ? v / 1000 + "k" : v)}
          />
        </Card>

        <Card className="p-4">
          <RevenueCard
            revenue={data?.lifetime_revenue}
            avgYear={data?.average_yearly_revenue}
            avgMonth={data?.average_monthly_revenue}
          />
        </Card>
      </div>
    </div>
  );
};

export default RevenueSummary;
