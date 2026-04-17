import ContentLayout from "@common/MasterLayout/ContentLayout";
import React, { useState } from "react";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import { Button } from "@pages/components/ui/button";
import CustomeTab from "@common/components/CustomeTab";
import RevenueSummary from "./RevenueSummary";
import BillingHistory from "./BillingHistory";
import DeleteModal from "@common/components/CustomeDelete";
import { Badge } from "@pages/components/ui/badge";

const revenueOrBilling = [
  { id: "revenue", name: "Revenue Summaries", component: <RevenueSummary /> },
  { id: "billing", name: "Billing History", component: <BillingHistory /> },
];

const DetailView = () => {
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");
  const activeModule = revenueOrBilling.find((item) => item.id === activeTab);

  return (
    <ContentLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-base font-semibold">Golds Fitness</span>
            <Badge
              className="bg-badge_bg_green border-none text-green_text rounded-xl w-auto"
              variant="future_lead"
              label="Active"
            />
          </div>

          <div className="flex flex-wrap text-xs gap-2 items-center">
            <span className="font-medium">Bangalore</span>
            <Badge
              className="bg-plan_bg_purple border-none text-plan_purple rounded-lg w-auto h-4"
              variant="future_lead"
              label="Yearly"
            />
          </div>
        </div>

        <Button
          variant="danger"
          size="addbutton"
          className="w-full sm:w-auto"
          onClick={() => setSuspendOpen(true)}
        >
          Suspend
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <HeaderCard />
      </div>

      {/* Tabs + Content */}
      <div className="flex flex-col mt-6 gap-4">
        <CustomeTab
          tabList={revenueOrBilling}
          defaultVal="revenue"
          tabsListClass="p-[1px] w-full sm:w-[400px]"
          onChange={(value) => setActiveTab(value)}
        />

        <div className="w-full">{activeModule?.component}</div>
      </div>

      {/* Modal */}
      <DeleteModal
        open={suspendOpen}
        setOpen={setSuspendOpen}
        header="Delete Employee"
        description="Are you sure you want to delete this employee?"
      />
    </ContentLayout>
  );
};

export default DetailView;
