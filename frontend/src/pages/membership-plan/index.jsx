import ContentLayout from "@common/MasterLayout/ContentLayout";
import CustomeTab from "@common/components/CustomeTab";
import { Button } from "@pages/components/ui/button";
import { useState } from "react";
import CreateMembershipForm from "./CreateForm";
import PlanCard from "./PlanCard";
import { CarouselSize } from "@common/components/CustomeCarousel";
import { membershipPlanColorPalette } from "@constants/membership-color-palette";
import { usePlansQuery } from "@api-queries/center-admin/membership-plan/Query";
import { Spinner } from "@pages/components/ui/spinner";
import { useLocation } from "react-router-dom";
import { useAppPermissions } from "@hooks/index";

const MembershipPlan = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "all";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [open, setOpen] = useState(false);

  const { data, isFetching } = usePlansQuery(activeTab);
  const { hydrated, canAddMembership } = useAppPermissions();

  if (!hydrated) return null;

  const Status = [
    { id: "all", name: "All" },
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
  ];

  const defaultPlans = [
    {
      membership_name: "Basic Plan",
      default_price: 0,
      duration_count: 1,
      duration_unit: "Month",
      membership_code: "N/A",
      description: "Start with a simple plan. Click edit to customize.",
      membership_features: [
        { feature_name: "Basic access" },
        { feature_name: "Limited features" },
      ],
      status: "inactive",
      membership_id: null,
      isDefault: true,
    },
    {
      membership_name: "Standard Plan",
      default_price: 0,
      duration_count: 3,
      duration_unit: "Months",
      membership_code: "N/A",
      description: "A standard plan for a standard training.",
      membership_features: [
        { feature_name: "More features" },
        { feature_name: "Better flexibility" },
        { feature_name: "Personal Trainer" },
      ],
      status: "inactive",
      membership_id: null,
      isDefault: true,
    },
    {
      membership_name: "Premium Plan",
      default_price: 0,
      duration_count: 3,
      duration_unit: "Months",
      membership_code: "N/A",
      description: "Enjoy more features with premium",
      membership_features: [
        { feature_name: "More features" },
        { feature_name: "Personal Trainer" },
        { feature_name: "Medical Support" },
        { feature_name: "24x7 Service Support" },
        { feature_name: "Better flexibility" },
      ],
      status: "inactive",
      membership_id: null,
      isDefault: true,
    },
  ];

  return (
    <ContentLayout>
      {/* Header */}
      <div className="text-lg sm:text-xl font-semibold text-textblack">
        Available Membership Plans
      </div>

      {/* Tabs + Button */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 my-4">
        <div className="w-full lg:w-auto">
          <CustomeTab
            tabList={Status}
            defaultVal={initialTab}
            tabsListClass="w-full sm:w-[400px] max-w-full p-[1px]"
            onChange={(value) => setActiveTab(value)}
          />
        </div>

        {canAddMembership && (
          <Button
            size="addbutton"
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto justify-center"
          >
            + Create New Plan
          </Button>
        )}
      </div>

      {/* Default Plans */}
      {data?.length === 0 && (
        <div className="flex items-center justify-center pt-6 sm:pt-10">
          <CarouselSize>
            {defaultPlans.map((plan, index) => (
              <PlanCard
                key={index}
                data={plan}
                colors={
                  membershipPlanColorPalette[
                    index % membershipPlanColorPalette.length
                  ]
                }
              />
            ))}
          </CarouselSize>
        </div>
      )}

      {/* Existing Plans */}
      {data?.length > 0 && (
        <div>
          {isFetching ? (
            <div className="flex justify-center items-center py-10">
              <Spinner />
            </div>
          ) : (
            <CarouselSize>
              {data?.map((plan, index) => (
                <PlanCard
                  key={index}
                  data={plan}
                  colors={
                    membershipPlanColorPalette[
                      index % membershipPlanColorPalette.length
                    ]
                  }
                />
              ))}
            </CarouselSize>
          )}
        </div>
      )}

      <CreateMembershipForm open={open} setOpen={setOpen} />
    </ContentLayout>
  );
};

export default MembershipPlan;