import {
  useRenewSubscriptionQuery,
  useChangeSubscriptionMutation,
} from "@api-queries/center-admin/Dashboard/Query";
import CustomeModal from "@common/components/CustomeModal";
import { Button } from "@pages/components/ui/button";
import { formatTextDate } from "@utils/helper";
import { useFormik } from "formik";
import { useState } from "react";

const RenewSubscription = ({ open, setOpen }) => {
  const [showUpgradeFields, setShowUpgradeFields] = useState(false);
  const { data, isLoading } = useRenewSubscriptionQuery();
  const { mutateAsync: changeSubscription } = useChangeSubscriptionMutation();

  const currentSubscriptionDuration =
    data?.pricing_options?.selected_subscription_duration || "";

  const upgradedSubscriptionDuration =
    currentSubscriptionDuration === "yearly"
      ? "monthly"
      : currentSubscriptionDuration === "monthly"
        ? "yearly"
        : "";

  const currentPackageDetails = [
    {
      label: "Billing Cycle",
      value: currentSubscriptionDuration || "N/A",
    },
    {
      label: "Expiry Date",
      value: formatTextDate(data?.expiry_info?.latest_end_date) || "N/A",
    },
    {
      label: "Amount Paid",
      value: data?.pricing_options?.total_amount_payable?.toFixed(2) || "N/A",
    },
  ];

  const initialValues = {
    subscription_duration: "",
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async () => {
      try {
        const subscriptionDuration = showUpgradeFields
          ? upgradedSubscriptionDuration
          : currentSubscriptionDuration;

        console.log("FORM subscription_duration 👉", subscriptionDuration);
        await changeSubscription({
          subscription_duration: subscriptionDuration,
        });

        setOpen(false);
        setShowUpgradeFields(false);
        formik.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header="Renew Subscription"
      className="max-w-xl w-full"
    >
      <form className="space-y-5" onSubmit={formik.handleSubmit}>
        {/* CURRENT PLAN */}
        <div className="rounded-xl border bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-semibold">
            Current Subscription Details
          </h3>

          <div className="space-y-2 text-sm">
            {currentPackageDetails.map((item) => (
              <div key={item.label} className="flex justify-between gap-4">
                <span className="text-gray-500 ">{item.label}</span>
                <span className="font-medium capitalize">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INFO TEXT
        <p className="text-sm text-gray-500">
          Continue with your current plan or upgrade before proceeding to
          payment.
        </p> */}

        {/* UPGRADE SECTION */}
        {showUpgradeFields && (
          <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-white">
            <div className="col-span-2 flex items-center justify-between gap-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">
                Upgrade billing cycle
              </span>
              <span className="text-sm font-medium capitalize text-onboard_primary">
                {upgradedSubscriptionDuration || "N/A"}
              </span>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between items-center">
          <Button
            size="addbutton"
            type="button"
            variant="button_filter"
            onClick={() => setShowUpgradeFields((prev) => !prev)}
          >
            {showUpgradeFields ? "Cancel Upgrade" : "Upgrade Plan"}
          </Button>

          <Button type="submit" size="addbutton">
            {showUpgradeFields ? "Upgrade & Pay" : "Renew & Pay"}
          </Button>
        </div>
      </form>
    </CustomeModal>
  );
};

export default RenewSubscription;
