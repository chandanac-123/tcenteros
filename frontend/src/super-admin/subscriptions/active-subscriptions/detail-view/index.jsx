import ContentLayout from "@common/MasterLayout/ContentLayout";
import React, { useState } from "react";
import HeaderCard from "@super-admin/subscriptions/components/HeaderCards";
import { Button } from "@pages/components/ui/button";
import CustomeTab from "@common/components/CustomeTab";
import RevenueSummary from "./RevenueSummary";
import BillingHistory from "./BillingHistory";
import DeleteModal from "@common/components/CustomeDelete";
import { Badge } from "@pages/components/ui/badge";
import {
  Briefcase,
  Calendar,
  Clock,
  Network,
  Receipt,
  Split,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useBillingHistoryQuery,
  useSubscriptionGetByIdQuery,
  useSuspendCenterMutation,
} from "@api-queries/super-admin/subcriptions/Query";
import CustomeBreadcrumb from "@common/components/CustomeBreadcrumb";

const DetailView = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const { mutateAsync: suspendSubscription, isPending } =
    useSuspendCenterMutation();
  const { data } = useSubscriptionGetByIdQuery(id);
  console.log("View Details: Data:",data);
  
  const { data: billing_history, isLoading } = useBillingHistoryQuery(
    id
  );
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");
  const revenueOrBilling = [
    {
      id: "revenue",
      name: "Revenue Summaries",
      component: <RevenueSummary data={data} />,
    },
    {
      id: "billing",
      name: "Billing History",
      component: <BillingHistory data={billing_history} />,
    },
  ];

  const handleSuspend = async () => {
    try {
      await suspendSubscription(id);
      setSuspendOpen(false);
    } catch (err) {
      return;
    }
  };

  const cardsData = [
    {
      label: "Total Revenue",
      value: data?.total_revenue || 0,
      icon: <Briefcase size={16} strokeWidth={2.75} />,
    },
    {
      label: "Monthly Revenue",
      value: data?.current_month_revenue || 0,
      icon: <Receipt size={16} strokeWidth={2.75} />,
    },
    {
      label: "Renewal Date",
      value: data?.renewal_date || 0,
      icon: <Calendar size={16} strokeWidth={2.75} />,
    },
    {
      label: "Days Remaining",
      value: data?.days_remaining || 0,
      icon: <Clock size={16} strokeWidth={2.75} />,
    },
    {
      label: "Network commission",
      value: data?.network_commission || 0,
      icon: <Network size={16} strokeWidth={2.75} />,
    },
    {
      label: "Branch Count",
      value: data?.total_purchased_branch_count || 0,
      icon: <Split size={16} strokeWidth={2.75} />,
    },
  ];
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
          <CustomeBreadcrumb
            goBack={() => navigate("/subscriptions/active-subscriptions")}
            buttonName="Active subscriptions list"
            currentPageName="Active subscriptions Details"
          />
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
        <HeaderCard cardsData={cardsData} />
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
        suspend={true}
        onConfirm={handleSuspend}
        header="Are you sure you want to suspend this subscription?"
        description="This Subscription will be removed from your listing the center will lost the full access as per the subscription This action cannot be undone.?"
      />
    </ContentLayout>
  );
};

export default DetailView;
