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
  BellRing,
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
  useSendReminder,
  useSubscriptionGetByIdQuery,
  useSuspendCenterMutation,
} from "@api-queries/super-admin/subcriptions/Query";
import CustomeBreadcrumb from "@common/components/CustomeBreadcrumb";

const DetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutateAsync: suspendSubscription, isPending } =
    useSuspendCenterMutation();
  const { data } = useSubscriptionGetByIdQuery(id);

  const { data: billing_history, isLoading } = useBillingHistoryQuery(
    id
  );
  const { mutate: sendReminder, isPending: reminderLoad } = useSendReminder();
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

  const status = data?.status?.toLowerCase()?.trim();
  const duration = data?.subscription_duration?.toLowerCase()?.trim();

  const statusStyles = {
    active: "bg-badge_bg_green text-green_text ",
    grace: "bg-plan_bg_purple  text-plan_purple",
    yearly: "bg-plan_bg_purple  text-plan_purple",
    due: "bg-red_bg text-red_text border-red",
    monthly: "bg-badge_blue_bg text-badge_blue border border-badge_blue"
  };

  const statusLabels = {
    active: "Active",
    grace: "In Grace",
    yearly: "Yearly",
    monthly: "Monthly",
    due: "Due",
  };

  const cardsData = [
    {
      label: "Total Revenue",
      value: data?.this_month_total || 0,
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
      value: data?.networking_commission || 0,
      icon: <Network size={16} strokeWidth={2.75} />,
    },
    {
      label: "Branch Count",
      value: data?.branch_count || 0,
      icon: <Split size={16} strokeWidth={2.75} />,
    },
  ];
  const activeModule = revenueOrBilling.find((item) => item.id === activeTab);

  return (
    <ContentLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">

          {/* Name + City */}
          <div className="flex flex-wrap items-center">
            <span className="text-base font-semibold capitalize border-r-2 border-[#999999] pr-2">
              {isLoading ? (
                <span className="inline-block h-4 w-32 animate-pulse bg-gray-100 rounded" />
              ) : (
                data?.center_name
              )}
            </span>

            <span className="font-medium text-sm capitalize pl-2">
              {isLoading ? (
                <span className="inline-block h-3 w-20 animate-pulse bg-gray-100 rounded" />
              ) : (
                data?.city
              )}
            </span>
          </div>

          {/* Duration + Status */}
          <div className="flex">
            {/* Duration */}
            <div className="flex items-center gap-2 border-r-2 border-[#999] pr-2">
              <p className="text-[13px]">Duration</p> -
              {isLoading ? (
                <span className="inline-block h-5 w-20 animate-pulse bg-gray-100 rounded-full" />
              ) : (
                <div
                  className={`px-3 rounded-full text-[13px] ${statusStyles[duration] || "bg-gray-100 text-gray-500"
                    }`}
                >
                  {statusLabels[duration]}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 pl-2">
              <div className="flex items-center gap-2">
                <p className="text-[13px]">Status</p> -
                {isLoading ? (
                  <span className="inline-block h-5 w-20 animate-pulse bg-gray-200 rounded-full" />
                ) : (
                  <div
                    className={`px-3 rounded-full text-[13px] ${statusStyles[status] || "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {statusLabels[status]}
                  </div>
                )}
              </div>
            </div>
          </div>

          <CustomeBreadcrumb
            goBack={() => navigate("/subscriptions/active-subscriptions")}
            buttonName="Active subscriptions list"
            currentPageName="Active subscriptions Details"
          />
        </div>

        {/* Button */}
        <Button
          onClick={() => sendReminder(id)}
          disabled={reminderLoad || isLoading}
          size="addbutton"
          className="w-full sm:w-auto justify-center"
        >
          <BellRing />
          {isLoading ? "Loading..." : reminderLoad ? "Sending..." : "Send Reminder"}
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
