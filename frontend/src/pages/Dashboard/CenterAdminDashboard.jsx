import ContentLayout from "@common/masterLayout/ContentLayout";
import LineChart from "@common/charts/LineChart";
import SubCard from "./components/Cards";
import { Card } from "@pages/components/ui/card";
import CustomDatePicker from "@common/components/CustomeDatepicker";
import BarChart from "@common/charts/BarChart";
import { useDashboardQuery } from "@api-queries/center-admin/Dashboard/Query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@store/authStore";
import { useGetBranchCountQuery } from "@api-queries/center-admin/branch/Query";
import InstructionPage from "./components/InstructionPage";
import { formatIndianCurrency, getGreeting } from "@utils/helper";
import { useAppPermissions } from "@hooks/index";
import { Button } from "@pages/components/ui/button";
import RenewSubcription from "./components/RenewSubcription";
import AddBranchDetails from "@pages/branch/dashboard-branch/AddBranchDetails";

const CenterAdminDashboard = () => {
  const role = useAuthStore((state) => state.auth?.role);
  const is_subcenter = useAuthStore((state) => state.auth?.is_subcenter);
  const isCenterAdmin = role === "centeradmin";
  const [greeting, setGreeting] = useState(getGreeting());
  const [openAddBranch, setOpenAddbranch] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(false);
  const [renewSubscriptionOpen, setRenewSubscriptionOpen] = useState(false);
  const navigate = useNavigate();
  const firstLogin = useAuthStore((state) => state.firstLogin);
  const setFirstLogin = useAuthStore((state) => state.setFirstLogin);
  const { data: branchCountData } = useGetBranchCountQuery();
  const { hydrated, canCreateBranch } = useAppPermissions();
  if (!hydrated) return null;

  const isLimitReached =
    branchCountData &&
    branchCountData.created_subcenters === branchCountData.branches_purchased;
  console.log("isLimitReached: ", isLimitReached);

  useEffect(() => {
    if (firstLogin) {
      setInstructionOpen(true);
    }
    setFirstLogin(false);
  }, []);

  const { data, isLoading, error } = useDashboardQuery();
  const cardsData = [
    {
      label: "Total Employees",
      value: data?.total_employees || 0,
      onClick: () => navigate("/employee-management"),
    },
    {
      label: "Total Members",
      value: data?.total_members || 0,
      onClick: () => navigate("/crm/members"),
    },
    {
      label: "Active Memberships",
      value: data?.active_memberships || 0,
      onClick: () => navigate("/membership-plan?tab=active"),
    },
    {
      label: "Active Leads",
      value: 0,
      onClick: () => navigate("/crm?tab=leads"),
    },
    {
      label: "Total Guests",
      value: data?.total_guests || 0,
      onClick: () => navigate("/crm?tab=guests"),
    },
    {
      label: "Today Attendance",
      value: data?.today_attendance || 0,
      onClick: () => navigate("/attendance"),
    },
    {
      label: "Total Revenue",
      value: formatIndianCurrency(data?.total_revenue) || 0,
      onClick: () => navigate("/accounts"),
    },
    {
      label: "Total Expense",
      value: formatIndianCurrency(data?.total_expenses) || 0,
      onClick: () => navigate("/accounts"),
    },
    {
      label: "Net Profit",
      value: formatIndianCurrency(data?.net_profit) || 0,
      onClick: () => navigate("/accounts"),
    },
  ];

  const revenueLabels = data?.revenue_trend?.map((i) => i.month) || [];

  const incomeData = data?.revenue_trend?.map((i) => i.income) || [];

  const expenseData = data?.revenue_trend?.map((i) => i.expense) || [];
  const attendanceLabels = data?.attendance_chart?.map((i) => i.month) || [];

  const attendanceData =
    data?.attendance_chart?.map((i) => i.attendance_percentage) || [];

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 300000); //  every 5 min is enough
    return () => clearInterval(interval);
  }, []);

  const handleOpenBranch = () => {
    setOpenAddbranch(true);
  };

  return (
    <ContentLayout>
      <div className="gap-4 flex flex-col w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div className="flex flex-col">
            <span>{greeting}</span>
            <span className="text-xs">{data?.centeradmin_name}</span>
          </div>
          <div className="flex gap-2">
            {" "}
            {canCreateBranch && !isLimitReached && !is_subcenter && (
              <Button size="addbutton" onClick={handleOpenBranch}>
                + Setup Branch
              </Button>
            )}
            {isCenterAdmin && (
              <Button
                size="addbutton"
                onClick={() => setRenewSubscriptionOpen(true)}
              >
                Renew Subscription
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Row 1 → 5 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {cardsData.slice(0, 5).map((item, index) => (
              <SubCard
                key={index}
                label={item.label}
                value={item.value}
                index={index}
                onClick={item.onClick}
              />
            ))}
          </div>
          {/* Row 2 → 4 cards (full width evenly spaced) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {cardsData.slice(5, 9).map((item, index) => (
              <SubCard
                key={index}
                label={item.label}
                value={item.value}
                index={index + 5}
                onClick={item.onClick}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            {/* <Card className="p-4 h-full ">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <span className="font-semibold text-base">
                  Total Revenue Summary
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
                  {
                    label: "Contacted Lead",
                    data: [1500, 1400, 1300, 1500, 1400, 1500],
                    borderColor: "#FACC15",
                  },
                  {
                    label: "Converted Lead",
                    data: [300, 200, 250, 180, 220, 260],
                    borderColor: "#55EFC2",
                  },
                ]}
                yMin={0}
                yMax={10000}
                tickFormat={(v) => (v >= 1000 ? v / 1000 + "k" : v)}
              />
            </Card> */}

            <Card className="p-4 h-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <span className="font-semibold text-base">
                  Total Attendance
                </span>
                {/* <span>
                  <CustomDatePicker pickerType="year" />
                </span> */}
              </div>
              <LineChart
                labels={attendanceLabels}
                datasets={[
                  {
                    label: "Attendance %",
                    data: attendanceData,
                    borderColor: "#3B82F6",
                  },
                ]}
                yMin={0}
                yMax={100}
                stepSize={20}
                tickFormat={(v) => v + "%"}
              />
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-4 h-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <span className="font-semibold text-base">Revenue Trend</span>
                {/* <span>
                  <CustomDatePicker pickerType="year" />
                </span> */}
              </div>
              <BarChart
                isDashboard={true}
                labels={revenueLabels}
                datasets={[
                  {
                    label: "Income",
                    data: incomeData,
                    backgroundColor: "#15CAB8",
                  },
                  {
                    label: "Expenses",
                    data: expenseData,
                    backgroundColor: "#377CF6",
                  },
                ]}
              />
            </Card>
          </div>
        </div>

      </div>
      <InstructionPage open={instructionOpen} setOpen={setInstructionOpen} />
      <RenewSubcription
        open={renewSubscriptionOpen}
        setOpen={setRenewSubscriptionOpen}
      />
      <AddBranchDetails open={openAddBranch} onOpenChange={setOpenAddbranch} />
    </ContentLayout>
  );
};

export default CenterAdminDashboard;
