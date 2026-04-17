import ContentLayout from "@common/MasterLayout/ContentLayout";
import { getGreeting } from "@utils/helper";
import { useEffect, useState } from "react";
import { Card } from "@pages/components/ui/card";
import LineChart from "@common/charts/LineChart";
import CustomDatePicker from "@common/components/CustomeDatepicker";
import HeaderCard from "./components/HeaderCards";
import BaseCard from "./components/BaseCard";
import MultiRingChart from "@common/charts/MultiRingChart";
import {
  NotebookPen,
  Receipt,
  Users,
} from "lucide-react";


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
      icon: <Users size={16} strokeWidth={2.75} />,
    },
    {
      label: "New Centers This Month",
      value: 0,
      icon: <Receipt size={16} strokeWidth={2.75} />,
    },
    {
      label: "Commission Payable",
      value: 0,
      icon: <NotebookPen size={16} strokeWidth={2.75} />,
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
          <HeaderCard dashboardHead={true} />
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
