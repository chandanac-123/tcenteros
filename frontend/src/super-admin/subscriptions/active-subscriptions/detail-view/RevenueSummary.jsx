import LineChart from "@common/charts/LineChart";
import CustomDatePicker from "@common/components/CustomeDatepicker";
import { Card } from "@pages/components/ui/card";
import RevenueCard from "@super-admin/subscriptions/components/RevenueCard";
import React from "react";

const RevenueSummary = () => {
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

        <Card className="p-4">
          <RevenueCard />
        </Card>
      </div>
    </div>
  );
};

export default RevenueSummary;
